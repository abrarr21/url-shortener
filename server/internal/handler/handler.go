package handler

import (
	"net/http"

	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/database"
	"github.com/abrarr21/url-shortener/internal/shortener"
)

type Handler struct {
	DB      *database.Database
	Cfg     *config.Config
	Service *shortener.Service
}

func NewHandler(db *database.Database, cfg *config.Config, svc *shortener.Service) *Handler {
	return &Handler{
		DB:      db,
		Cfg:     cfg,
		Service: svc,
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
