package cache

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

var ErrCacheMiss = errors.New("cache miss")

type URLCache struct {
	client *redis.Client
	ttl    time.Duration
}

func NewURLCache(c *Cache, ttl time.Duration) *URLCache {
	return &URLCache{
		client: c.Client,
		ttl:    ttl,
	}
}

// look up in redis before DB
func (u *URLCache) GetURL(ctx context.Context, code string) (string, error) {
	key := "url" + code
	value, err := u.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", ErrCacheMiss // caller now knows to go to DB
	}

	if err != nil {
		return "", err // redis itself is broken
	}

	return value, nil // cache hit
}

// this fns is called after DB Read or immediately at creation time
func (u *URLCache) SetURL(ctx context.Context, code, longURL string) error {
	key := "url" + code
	return u.client.Set(ctx, key, longURL, u.ttl).Err()
}
