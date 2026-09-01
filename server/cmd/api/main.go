package main

import (
	"log"
	"net/http"
	"time"

	"github.com/abrarr21/url-shortener/internal/config"
	"github.com/abrarr21/url-shortener/internal/database"
)

func main() {
	cfg := config.Load()

	// ---------- Postgres + Redis Connection -----------
	pool, err := database.ConnectDB(cfg.Database.DbUrl)
	if err != nil {
		log.Fatalf("main.db.connect: %v", err)
	}
	defer pool.Close()

	redisClient, err := database.ConnectRedis(cfg.Redis.RedisUrl)
	if err != nil {
		log.Fatalf("main.redis.connect: %v", err)
	}
	defer redisClient.Close()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		if err := pool.Ping(ctx); err != nil {
			http.Error(w, `{"postgres": "NOT OK", redis: "OK"}`, http.StatusServiceUnavailable)
			return
		}

		if err := redisClient.Ping(ctx).Err(); err != nil {
			http.Error(w, `{"postgres":"OK","redis":"NOT OK"}`, http.StatusServiceUnavailable)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"postgres":"OK","redis":"OK"}`))
	})

	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  1 * time.Minute,
	}

	log.Println("Connected to Database and Redis")
	log.Println("server running on port: ", cfg.Server.Port)

	if err := srv.ListenAndServe(); err != nil {
		srv.ErrorLog.Fatal("server failed")
	}
}
