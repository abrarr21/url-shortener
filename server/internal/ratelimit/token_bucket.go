package ratelimit

import (
	"context"
	_ "embed"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

//go:embed token_bucket.lua
var tokenBucketScript string

// Limiter enforces a per-client token bucket, backed by Redis so the
// state is correctly shared across every API instance — not just the
// one that happens to handle a given request.
type Limiter struct {
	rdb        *redis.Client
	script     *redis.Script
	capacity   int
	refillRate float64 // tokens added per second
}

func NewLimiter(rdb *redis.Client, capacity int, refillRate float64) *Limiter {
	return &Limiter{
		rdb:        rdb,
		script:     redis.NewScript(tokenBucketScript),
		capacity:   capacity,
		refillRate: refillRate,
	}
}

type Result struct {
	Allowed    bool
	Remaining  int
	RetryAfter time.Duration // only meaningful when Allowed is false
}

// Allow checks and (if allowed) spends one token for clientID, as a
// single atomic Redis operation — no separate read-then-write steps
// for another request to race against.
func (l *Limiter) Allow(ctx context.Context, clientID string) (Result, error) {
	key := fmt.Sprintf("ratelimit:%s", clientID)

	res, err := l.script.Run(ctx, l.rdb, []string{key}, l.capacity, l.refillRate, 1).Result()
	if err != nil {
		return Result{}, fmt.Errorf("rate limit script failed: %w", err)
	}

	vals, ok := res.([]interface{})
	if !ok || len(vals) != 2 {
		return Result{}, fmt.Errorf("unexpected rate limit script result: %v", res)
	}

	allowed := vals[0].(int64) == 1
	remaining := int(vals[1].(int64))

	result := Result{Allowed: allowed, Remaining: remaining}
	if !allowed {
		// approximate wait until at least one token is available again
		result.RetryAfter = time.Duration(float64(time.Second) / l.refillRate)
	}
	return result, nil
}
