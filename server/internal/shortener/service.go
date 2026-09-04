package shortener

import (
	"context"
	"errors"
	"log/slog"

	"github.com/abrarr21/url-shortener/internal/cache"
	"github.com/abrarr21/url-shortener/internal/database/generated"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

var ErrNotFound = errors.New("short code not found")

type Service struct {
	snowflake *SnowflakeGenerator
	queries   generated.Querier
	cache     *cache.URLCache
	logger    *slog.Logger
}

func NewService(snowflake *SnowflakeGenerator, queries generated.Querier, urlCache *cache.URLCache, logger *slog.Logger) *Service {
	return &Service{
		snowflake: snowflake,
		queries:   queries,
		cache:     urlCache,
		logger:    logger,
	}
}

func (s *Service) Shorten(ctx context.Context, longUrl string) (string, error) {
	id, err := s.snowflake.NextID()
	if err != nil {
		return "", err
	}
	shortcode := toBase62(id)

	// write to DB
	_, err = s.queries.CreateURL(ctx, generated.CreateURLParams{
		ID:        id,
		ShortCode: shortcode,
		LongUrl:   longUrl,
		UserID:    pgtype.Int8{Valid: false},
	})
	if err != nil {
		return "", err
	}

	// populate cache immediately after DB write to avoid cache miss on next lookup
	if err := s.cache.SetURL(ctx, shortcode, longUrl); err != nil {
		s.logger.Warn("write-through cache populate failed", "err", shortcode)
	} else {
		s.logger.Info("cache populated", "code", shortcode)
	}

	return shortcode, nil
}

func (s *Service) Lookup(ctx context.Context, shortcode string) (string, error) {
	// redis lookup
	if url, err := s.cache.GetURL(ctx, shortcode); err == nil {
		s.logger.Info("served from cache", "code", shortcode)
		return url, nil
	} else if !errors.Is(err, cache.ErrCacheMiss) {
		// Redis errored — degrade gracefully, fall back to DB
		s.logger.Warn("redis error, falling back to db", "error", err)
	}
	// cache miss (or Redis down) — go to the source of truth(DB)
	url, err := s.queries.GetUrlByShortCode(ctx, shortcode)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrNotFound
		}
		return "", err
	}
	s.logger.Info("served from db", "code", shortcode)

	// backfill the cache so the next lookup is a hit
	if err := s.cache.SetURL(ctx, shortcode, url.LongUrl); err != nil {
		s.logger.Info("cache populate failed", "error", err, "code", shortcode)
	}

	return url.LongUrl, nil
}
