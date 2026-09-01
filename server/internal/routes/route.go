package routes

import (
	"log/slog"

	"github.com/abrarr21/url-shortener/internal/handler"
	customm "github.com/abrarr21/url-shortener/internal/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func RegisterAllRoutes(h *handler.Handler, logger *slog.Logger) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(customm.StructuredLogger(logger))

	r.Get("/health", h.CheckHealth)

	return r
}
