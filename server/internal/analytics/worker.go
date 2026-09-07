package analytics

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/abrarr21/url-shortener/internal/database/generated"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Worker struct {
	rdb        *redis.Client
	pool       *pgxpool.Pool
	queries    *generated.Queries
	workerName string
	logger     *slog.Logger
}

func NewWorker(rdb *redis.Client, pool *pgxpool.Pool, workerName string, logger *slog.Logger) *Worker {
	return &Worker{
		rdb:        rdb,
		pool:       pool,
		queries:    generated.New(pool),
		workerName: workerName,
		logger:     logger,
	}
}

func (w *Worker) Run(ctx context.Context) error {
	err := w.rdb.XGroupCreateMkStream(ctx, ClicksStream, ConsumerGroup, "$").Err()
	if err != nil && !strings.Contains(err.Error(), "BUSYGROUP") {
		return fmt.Errorf("creating worker group: %w", err)
	}
	w.logger.Info("analytics worker started", "worker", w.workerName, "stream", ClicksStream)

	go w.runClaimSweep(ctx)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		streams, err := w.rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group:    ConsumerGroup,
			Consumer: w.workerName,
			Streams:  []string{ClicksStream, ">"},
			Count:    50,
			Block:    2 * time.Second,
		}).Result()
		if err != nil {
			if !errors.Is(err, redis.Nil) {
				w.logger.Info("XReadGroup failed", "error", err)
			}
			continue // block timeout, nothing new - loop again
		}

		for _, stream := range streams {
			for _, msg := range stream.Messages {
				if err := w.processEvent(ctx, msg); err != nil {
					w.logger.Warn("processing failed, will retry", "event_id", msg.ID, "error", err)
					continue // not acknowledged, redis redelivers it later
				}
				if err := w.rdb.XAck(ctx, ClicksStream, ConsumerGroup, msg.ID).Err(); err != nil {
					w.logger.Error("ack failed", "event_id", msg.ID, "error", err)
				}
			}
		}
	}
}

func (w *Worker) processEvent(ctx context.Context, msg redis.XMessage) error {
	shortCode, ok := msg.Values["short_code"].(string)
	if !ok {
		return fmt.Errorf("malformed event %s: missing short_code", msg.ID)
	}

	tx, err := w.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin TxN: %w", err)
	}
	defer tx.Rollback(ctx)

	qtx := w.queries.WithTx(tx)

	rows, err := qtx.MarkEventProcessed(ctx, msg.ID)
	if err != nil {
		return fmt.Errorf("mark event processed: %w", err)
	}

	if rows == 0 {
		w.logger.Info("duplicate event skipped", "event_id", msg.ID, "short_code", shortCode)
		return tx.Commit(ctx) // already handled this exact event - no op
	}

	result, err := qtx.IncrementClickCount(ctx, shortCode)
	if err != nil {
		return fmt.Errorf("incement click count for %s: %w", shortCode, err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx: %w", err)
	}

	age := time.Since(result.CreatedAt.Time)
	score := DecayedScore(result.ClickCount, age)

	if err := w.rdb.ZAdd(ctx, TrendingZset, redis.Z{
		Score:  score,
		Member: shortCode,
	}).Err(); err != nil {
		w.logger.Error("trending score update failed, count is still correct", "short_code", shortCode, "error", err)
	}

	w.logger.Info("click processed", "event_id", msg.ID, "short_code", shortCode, "click_count", result.ClickCount, "score", score)
	return nil
}

// runClaimSweep periodically reclaims messages that are delivered to some consumer but never acknowledged = most commonly because that consumer crashed
func (w *Worker) runClaimSweep(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.claimAbandoned(ctx)
		}
	}
}

func (w *Worker) claimAbandoned(ctx context.Context) {
	messages, _, err := w.rdb.XAutoClaim(ctx, &redis.XAutoClaimArgs{
		Stream:   ClicksStream,
		Group:    ConsumerGroup,
		Consumer: w.workerName,
		MinIdle:  30 * time.Second,
		Start:    "0",
		Count:    50,
	}).Result()
	if err != nil {
		w.logger.Error("XAutoClaim failed", "error", err)
		return
	}

	for _, msg := range messages {
		w.logger.Warn("reclaimed abandoned event", "event_id", msg.ID, "worker", w.workerName)
		if err := w.processEvent(ctx, msg); err != nil {
			w.logger.Warn("reclaimed event processing failed, will retry", "event_id", msg.ID, "error", err)
			continue
		}
		w.rdb.XAck(ctx, ClicksStream, ConsumerGroup, msg.ID)
	}
}
