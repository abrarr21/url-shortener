package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type Database struct {
	Postgres *pgxpool.Pool
	Redis    *redis.Client
}

func NewDatabase(dbUrl, redisUrl string) (*Database, error) {
	pool, err := connectDB(dbUrl)
	if err != nil {
		return nil, fmt.Errorf("connect postgres: %w", err)
	}

	redisClient, err := connectRedis(redisUrl)
	if err != nil {
		pool.Close()
		return nil, fmt.Errorf("connect redis: %w", err)
	}

	return &Database{
		Postgres: pool,
		Redis:    redisClient,
	}, nil
}

func connectDB(dbUrl string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(dbUrl)
	if err != nil {
		return nil, fmt.Errorf("parse database config: %w", err)
	}

	config.MaxConns = 25
	config.MinConns = 5
	config.MaxConnLifetime = 5 * time.Minute

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("create database pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return pool, nil
}

func connectRedis(redisUrl string) (*redis.Client, error) {
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisUrl,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		redisClient.Close()
		return nil, fmt.Errorf("ping redis: %w", err)
	}

	return redisClient, nil
}

func (db *Database) Close() {
	db.Postgres.Close()
	db.Redis.Close()
}
