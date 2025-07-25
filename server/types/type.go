package types

import (
	"sync"

	"github.com/gorilla/websocket"
)

type User struct {
	UserID   string `json:"userid"`
	Username string `json:"username"`
}

type Room struct {
	RoomID         int
	CreatedBy      string
	ConnectedUsers []User
	Mutex          sync.Mutex
	WebSockets 	   map[string]*websocket.Conn
}

type WebSocketUser struct {
	UserID string
	Conn   *websocket.Conn
}

type DrawingData struct {
	Type   string `json:"type"`   // always "draw"
	RoomID int    `json:"roomid"`
	UserID string `json:"userid"`
	Data   struct {
		X     float64 `json:"x"`     // Using float for pixel precision
		Y     float64 `json:"y"`
		Color string  `json:"color"`
		Size  int     `json:"size"`
		Tool  string  `json:"tool"`  // pen, eraser, etc.
	} `json:"data"`
}
