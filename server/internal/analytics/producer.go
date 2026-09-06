package analytics

import (
	"context"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"
)

type Producer struct {
	rdb    *redis.Client
	logger *slog.Logger
}

func NewProducer(rdb *redis.Client, logger *slog.Logger) *Producer {
	return &Producer{
		rdb:    rdb,
		logger: logger,
	}
}

// Every time someone clicks a shortened URL, this code records the click in a Redis Stream so you can process/analyze it later
func (p *Producer) PublishClick(shortCode, ip string) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cmd := p.rdb.XAdd(ctx, &redis.XAddArgs{
		Stream: ClicksStream, //Add a new entry to the stream called ClickStream
		MaxLen: 1_000_000,
		Approx: true,
		Values: map[string]interface{}{
			"short_code": shortCode,
			"ts":         time.Now().Unix(),
			"ip":         ip,
		},
	})

	_, err := cmd.Result()
	if err != nil {
		p.logger.Info("click event dropped for", shortCode, err)
	}
}
