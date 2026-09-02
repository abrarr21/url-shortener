package routes

import (
	"github.com/abrarr21/url-shortener/internal/handler"
	"github.com/go-chi/chi/v5"
)

func URLRoutes(r chi.Router, h *handler.Handler) {
	r.Post("/api/shorten", h.ShortenURL)
	r.Get("/{shortcode}", h.RedirectURL)
}
