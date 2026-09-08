// Redis Pub/Sub relay
package hub

import (
	"context"
	"log/slog"

	"github.com/redis/go-redis/v9"
)

const DashboardChannel = "dashboard:update"

// RunBridge Subscribes to Redis and forwards every published messages straight into the local Hub - this is how updates cross the process boundary from the worker binary into API binary
func RunBridge(ctx context.Context, rdb *redis.Client, h *Hub, logger *slog.Logger) {
	sub := rdb.Subscribe(ctx, DashboardChannel)
	defer sub.Close()

	ch := sub.Channel()
	logger.Info("dashboard bridge subscribed", "channel", DashboardChannel)

	for {
		select {
		case <-ctx.Done():
			return

		case msg, ok := <-ch:
			if !ok {
				return
			}
			h.Broadcast([]byte(msg.Payload))
		}
	}
}
