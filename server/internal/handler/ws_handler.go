package handler

import (
	"net/http"

	"github.com/abrarr21/url-shortener/internal/hub"
	"github.com/coder/websocket"
)

func (h *Handler) DashboardWS(w http.ResponseWriter, r *http.Request) {
	conn, err := websocket.Accept(w, r, nil)
	if err != nil {
		return
	}

	client := hub.NewClient(h.Hub, conn, h.logger)
	h.Hub.Register(client)

	go client.WritePump(r.Context())
	client.ReadPump(r.Context()) // blocks until the client disconnects
}

func (h *Handler) Dashboard(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "web/dashboard.html")
}
