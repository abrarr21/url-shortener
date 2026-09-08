package hub

import (
	"context"
	"log/slog"
)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	logger     *slog.Logger
}

func NewHub(logger *slog.Logger) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		logger:     logger,
	}
}

// client connects
func (h *Hub) Register(c *Client) {
	h.register <- c
}

// client disconnects
func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}

// Broadcast is safe to call from any goroutine
func (h *Hub) Broadcast(msg []byte) {
	select {
	case h.broadcast <- msg:
	default:
		h.logger.Warn("hub broadcast channel full, dropping messages")
	}
}

// Run is the Hub's single goroutine -> the only place that ever touches h.clients, so no mutex is needed
func (h *Hub) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return

		case c := <-h.register:
			h.clients[c] = true
			h.logger.Info("client connected", "total", len(h.clients))

		case c := <-h.unregister:
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
				h.logger.Info("client disconnected", "total", len(h.clients))
			}

		case msg := <-h.broadcast:
			for c := range h.clients {
				select {
				case c.send <- msg:
				default:
					//this client's mailbox is full - its too slow, drop it
					close(c.send)
					delete(h.clients, c)
					h.logger.Warn("client dropped: send buffer full")
				}
			}
		}
	}
}
