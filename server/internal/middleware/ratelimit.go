package middleware

import (
	"log/slog"
	"net"
	"net/http"
	"strconv"
	"strings"

	"github.com/abrarr21/url-shortener/internal/ratelimit"
	"github.com/abrarr21/url-shortener/internal/utils"
)

// RateLimit rejects requests once a client's token bucket is empty.
// On Redis errors, it fails OPEN (lets the request through) rather than
// failing closed — a Redis outage should degrade rate limiting, not take
// the whole API down with it. Flip this if your risk tolerance differs.
func RateLimit(limiter *ratelimit.Limiter, logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			clientID := clientIP(r)

			result, err := limiter.Allow(r.Context(), clientID)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(result.Remaining))

			if !result.Allowed {
				logger.Warn("rate limit exceeded", "client_ip", clientID, "path", r.URL.Path)
				retryAfterSecs := int(result.RetryAfter.Seconds()) + 1
				w.Header().Set("Retry-After", strconv.Itoa(retryAfterSecs))
				utils.Error(w, http.StatusTooManyRequests, "rate limit exceeded, slow down", utils.CodeRateLimited, nil)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// clientIP prefers X-Forwarded-For, set by nginx, since RemoteAddr would otherwise be nginx's own container IP for every request once traffic passes through the load balancer — collapsing all real clients into a single shared bucket.
func clientIP(r *http.Request) string {
	if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
		parts := strings.Split(fwd, ",")
		return strings.TrimSpace(parts[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
