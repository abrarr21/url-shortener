package handler

import (
	"net/http"

	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/database"
)

type Handler struct {
	DB  *database.Database
	Cfg *config.Config
}

func NewHandler(db *database.Database, cfg *config.Config) *Handler {
	return &Handler{
		DB:  db,
		Cfg: cfg,
	}
}

func (h *Handler) CheckHealth(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	if err := h.DB.Postgres.Ping(ctx); err != nil {
		http.Error(w, `{"postgres": "NOT OK", redis: "OK"}`, http.StatusServiceUnavailable)
		return
	}

	if err := h.DB.Redis.Ping(ctx).Err(); err != nil {
		http.Error(w, `{"postgres":"OK","redis":"NOT OK"}`, http.StatusServiceUnavailable)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"postgres":"OK","redis":"OK"}`))
}
