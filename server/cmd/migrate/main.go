package main

import (
	"errors"
	"log/slog"
	"os"

	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/logger"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	cfg := config.Load()

	logger := logger.New(cfg.Server.Env)
	slog.SetDefault(logger)

	if len(os.Args) < 2 {
		logger.Error("Please provide a migration command: up or down")
		os.Exit(1)
	}

	m, err := migrate.New("file://migrations", cfg.Database.DbUrl)
	if err != nil {
		logger.Error("Failed to create migrate instance", "error", err)
	}
	defer m.Close()

	switch os.Args[1] {
	case "up":
		logger.Info("running migrations", "direction", "up")
		err = m.Up()

		if errors.Is(err, migrate.ErrNoChange) {
			logger.Info("No new migrations to apply")
			return
		}
		if err != nil {
			logger.Error("failed to run migrations", "direction", "up", "error", err)
			os.Exit(1)
		}

		logger.Info("migration completed successfully", "direction", "up")

	case "down":
		logger.Info("running migration rollback", "direction", "down")

		err = m.Steps(-1)
		if errors.Is(err, migrate.ErrNoChange) {
			logger.Info("no migrations to rollback")
			return
		}
		if err != nil {
			logger.Error("failed to rollback migration", "direction", "down", "error", err)
			os.Exit(1)
		}
		logger.Info("migrations rollback completed successfully")

	default:
		logger.Error("unknown migration command", "command", os.Args[1], "expected", "up or down")
		os.Exit(1)
	}

}
