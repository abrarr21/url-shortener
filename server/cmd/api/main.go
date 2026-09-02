package main

import (
	"log/slog"
	"net/http"
	"os"
	"time"

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

	// ---------- Postgres + Redis Connection -----------
	logger.Info("connecting to database and redis")
	db, err := database.NewDatabase(cfg.Database.DbUrl, cfg.Redis.RedisUrl)
	if err != nil {
		logger.Error("failed to initialize database", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	logger.Info("postgres and redis connected")

	queries := generated.New(db.Postgres)

	// Dependency injection
	snowflake, err := shortener.NewSnowflakeGenerator(cfg.NodeID.NodeID)
	if err != nil {
		logger.Error("failed to initialize snowflake generator", "error", err)
		os.Exit(1)
	}

	svc := shortener.NewService(snowflake, queries)
	h := handler.NewHandler(db, cfg, svc)
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
