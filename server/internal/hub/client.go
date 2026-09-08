package hub

import (
	"context"
	"log/slog"
	"time"

	"github.com/coder/websocket"
)

const (
	sendBufferChSize = 256
	writeTimeout     = 10 * time.Second
	pingPeriod       = 50 * time.Second
)

type Client struct {
	hub    *Hub
	conn   *websocket.Conn
	send   chan []byte
	logger *slog.Logger
}

func NewClient(h *Hub, conn *websocket.Conn, logger *slog.Logger) *Client {
	return &Client{
		hub:    h,
		conn:   conn,
		send:   make(chan []byte, sendBufferChSize),
		logger: logger,
	}
}

func (c *Client) WritePump(ctx context.Context) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close(websocket.StatusNormalClosure, "")
	}()

	for {
		select {
		case msg, ok := <-c.send:
			if !ok {
				return // Hub closed our mailbox - we're being disconnected
			}

			wctx, cancel := context.WithTimeout(ctx, writeTimeout)
			err := c.conn.Write(wctx, websocket.MessageText, msg)
			cancel()
			if err != nil {
				c.logger.Warn("write failed", "error", err)
				return
			}

		case <-ticker.C:
			pctx, cancel := context.WithTimeout(ctx, writeTimeout)
			err := c.conn.Ping(pctx)
			cancel()
			if err != nil {
				return
			}

		case <-ctx.Done():
			return
		}
	}
}

// ReadPump's only real job is noticing when the client disconnects - this dashboard is read-only, we don't expect messages from the browser
func (c *Client) ReadPump(ctx context.Context) {
	defer func() {
		c.hub.Unregister(c)
		c.conn.Close(websocket.StatusNormalClosure, "")
	}()

	for {
		if _, _, err := c.conn.Read(ctx); err != nil {
			return
		}
	}
}
