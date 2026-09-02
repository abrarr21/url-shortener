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

type NodeIDConfig struct {
	NodeID int64
}

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	NodeID   NodeIDConfig
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
			NodeID: nodeID,
		},
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}

	return fallback
}
