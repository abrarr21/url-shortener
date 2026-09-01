package middleware

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

func StructuredLogger(log *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

			next.ServeHTTP(ww, r)

			log.Info("request", "method", r.Method, "path", r.URL.Path, "status", ww.Status(), "bytes", ww.BytesWritten(), "duration_ms", time.Since(start).Milliseconds(), "request_id", middleware.GetReqID(r.Context()))
		})
	}
}
