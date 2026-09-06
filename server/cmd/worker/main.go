package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/abrarr21/url-shortener/internal/analytics"
	"github.com/abrarr21/url-shortener/internal/cache"
	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/database"
	"github.com/abrarr21/url-shortener/internal/logger"
)

func main() {
	cfg := config.Load()

	logger := logger.New(cfg.Server.Env)
	slog.SetDefault(logger)

	logger.Info("connected to database")
	db, err := database.NewDatabase(cfg.Database.DbUrl)
	if err != nil {
		logger.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	logger.Info("connecting to redis")
	cacheConn, err := cache.ConnectRedis(cfg.Redis.RedisUrl)
	if err != nil {
		logger.Error("failed to initialize redis", "error", err)
		os.Exit(1)
	}
	defer cacheConn.Close()

	worker := analytics.NewWorker(cacheConn.Client, db.Postgres, "worker-1", logger)
	if err := worker.Run(context.Background()); err != nil {
		logger.Error("worker stopped", "error", err)
		os.Exit(1)
	}
}
