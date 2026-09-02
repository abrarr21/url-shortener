package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"

	"github.com/abrarr21/url-shortener/internal/shortener"
	"github.com/abrarr21/url-shortener/internal/utils"
	"github.com/go-chi/chi/v5"
)

// request and response structs for the shorten URL endpoint
type shortenRequest struct {
	LongURL string `json:"long_url"`
}

type shortenResponse struct {
	ShortCode string `json:"short_code"`
	LongURL   string `json:"long_url"`
}

func (h *Handler) ShortenURL(w http.ResponseWriter, r *http.Request) {
	var req shortenRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := validateURL(req.LongURL); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	shortcode, err := h.Service.Shorten(r.Context(), req.LongURL)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to shorten url")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, shortenResponse{
		ShortCode: shortcode,
		LongURL:   req.LongURL,
	})

}

func (h *Handler) RedirectURL(w http.ResponseWriter, r *http.Request) {
	shortcode := chi.URLParam(r, "shortcode")

	longURL, err := h.Service.Lookup(r.Context(), shortcode)
	if err != nil {
		if errors.Is(err, shortener.ErrNotFound) {
			utils.WriteError(w, http.StatusNotFound, "short url not found")
			return
		}
		utils.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	http.Redirect(w, r, longURL, http.StatusFound)
}

func validateURL(raw string) error {
	if raw == "" {
		return errors.New("long_url is required")
	}

	u, err := url.ParseRequestURI(raw)
	if err != nil {
		return errors.New("long_url is not a valid URL")
	}

	if u.Scheme != "http" && u.Scheme != "https" {
		return errors.New("long_url must use http or https")
	}

	if u.Host == "" {
		return errors.New("long_url must include a host")
	}

	return nil
}
