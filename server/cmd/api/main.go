package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/abrarr21/url-shortener/internal/cache"
	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/database"
	"github.com/abrarr21/url-shortener/internal/database/generated"
	"github.com/abrarr21/url-shortener/internal/handler"
	"github.com/abrarr21/url-shortener/internal/logger"
	"github.com/abrarr21/url-shortener/internal/routes"
	"github.com/abrarr21/url-shortener/internal/shortener"
)

func main() {
	cfg := config.Load()

	// ---------- Logger ------------
	logger := logger.New(cfg.Server.Env)
	slog.SetDefault(logger)

	// --------- DB connection ---------
	logger.Info("connecting to database")
	db, err := database.NewDatabase(cfg.Database.DbUrl)
	if err != nil {
		logger.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	logger.Info("postgres connected")

	// --------- Redis connection ---------
	logger.Info("connecting to redis")
	cacheConn, err := cache.ConnectRedis(cfg.Redis.RedisUrl)
	if err != nil {
		logger.Error("failed to initialize redi", "error", err)
		os.Exit(1)
	}
	defer cacheConn.Close()
	logger.Info("redis connected")

	queries := generated.New(db.Postgres)

	urlCache := cache.NewURLCache(cacheConn, 2*time.Minute)

	// Dependency injection
	snowflake, err := shortener.NewSnowflakeGenerator(cfg.NodeID.NodeID)
	if err != nil {
		logger.Error("failed to initialize snowflake generator", "error", err)
		os.Exit(1)
	}

	svc := shortener.NewService(snowflake, queries, urlCache, logger)
	h := handler.NewHandler(db, cacheConn, cfg, svc)
	router := routes.RegisterAllRoutes(h, logger)

	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  1 * time.Minute,
	}

	logger.Info("server starting", "port", cfg.Server.Port)

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
