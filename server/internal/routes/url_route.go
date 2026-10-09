package routes

import (
	"github.com/abrarr21/url-shortener/internal/handler"
	"github.com/go-chi/chi/v5"
)

func URLRoutes(r chi.Router, h *handler.Handler) {
	r.Post("/shorten", h.ShortenURL)
	r.Get("/stats/{code}", h.GetStats)
	r.Get("/{shortcode}", h.RedirectURL)
}
