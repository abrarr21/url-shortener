package handler

import (
	"net/http"

	"github.com/abrarr21/url-shortener/internal/cache"
	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/database"
	"github.com/abrarr21/url-shortener/internal/shortener"
	"github.com/abrarr21/url-shortener/internal/utils"
)

type Handler struct {
	DB      *database.Database
	Cache   *cache.Cache
	Cfg     *config.Config
	Service *shortener.Service
}

func NewHandler(db *database.Database, c *cache.Cache, cfg *config.Config, svc *shortener.Service) *Handler {
	return &Handler{
		DB:      db,
		Cache:   c,
		Cfg:     cfg,
		Service: svc,
	}
}

func (h *Handler) CheckHealth(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	if err := h.DB.Postgres.Ping(ctx); err != nil {
		utils.Error(w, http.StatusServiceUnavailable, "database service unavailable", utils.CodeUnavailable, map[string]string{
			"postgres": "not_ok",
			"redis":    "ok",
		})
		return
	}

	if err := h.Cache.Ping(ctx); err != nil {
		utils.Error(w, http.StatusServiceUnavailable, "Cache service unavailable", utils.CodeUnavailable, map[string]string{
			"postgres": "ok",
			"redis":    "not_ok",
		})
		return
	}

	// w.Header().Set("Content-Type", "application/json")
	// w.WriteHeader(http.StatusOK)
	// w.Write([]byte(`{"postgres":"OK","redis":"OK"}`))

	utils.WriteJSON(w, http.StatusOK, map[string]string{"postgres": "OK", "redis": "OK"})
}
