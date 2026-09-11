package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	DbUrl string
}

type RedisConfig struct {
	RedisUrl string
}

type RateLimitConfig struct {
	Capacity   int
	RefillRate float64
}

type NodeIDConfig struct {
	NodeID   int64
	WorkerID string
}

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	Redis     RedisConfig
	NodeID    NodeIDConfig
	RateLimit RateLimitConfig
}

func Load() *Config {
	_ = godotenv.Load()

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("DATABASE_URL is missing in the env")
	}

	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		log.Fatal("REDIS_URL is missing in the env")
	}

	nodeIDStr := getEnv("NODE_ID", "0")
	nodeID, err := strconv.ParseInt(nodeIDStr, 10, 64)
	if err != nil {
		log.Fatalf("NODE_ID must be a valid integer, got %s", nodeIDStr)
	}

	workerID := getEnv("WORKER_ID", "worker-1")
	if workerID == "" {
		log.Println("WORKER_ID is missing, add to start the worker")
	}

	rateLimitCapacityStr := getEnv("RATELIMITCAPACITY", "100")
	rateLimitCapacity, err := strconv.Atoi(rateLimitCapacityStr)
	if err != nil {
		log.Fatalf("Rate_Limit_Capacity must be a valid integer, got %s", rateLimitCapacityStr)
	}

	rateLimitRefillRateStr := getEnv("RATELIMITREFILLRATE", "2.5")
	rateLimitRefillRate, err := strconv.ParseFloat(rateLimitRefillRateStr, 64)
	if err != nil {
		log.Fatalf("RATE_LIMIT_REFILL_RATE must be a valid float, got %s", rateLimitRefillRateStr)
	}

	return &Config{
		ServerConfig{
			Port: getEnv("PORT", "8080"),
			Env:  getEnv("ENV", "development"),
		},

		DatabaseConfig{
			DbUrl: dbUrl,
		},

		RedisConfig{
			RedisUrl: redisUrl,
		},

		NodeIDConfig{
			NodeID:   nodeID,
			WorkerID: workerID,
		},

		RateLimitConfig{
			Capacity:   rateLimitCapacity,
			RefillRate: rateLimitRefillRate,
		},
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}

	return fallback
}
