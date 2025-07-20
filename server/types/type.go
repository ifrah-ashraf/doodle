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
	CreatedBy      User
	ConnectedUsers []User
	Mutex          sync.Mutex
}

type WebSocketUser struct {
	UserID string
	Conn   *websocket.Conn
}
