package routes

import (
	"log"
	"net/http"
	"strconv"
	"sync"

	"doodle.io/types"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Type aliases for cleaner code
type User = types.User 
type Room = types.Room
type WebSocketUser = types.WebSocketUser

var (
	roomIDCounter = 0
	roomMutex     sync.Mutex
	Rooms         = make(map[int]*types.Room)
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}


// Function to join the room 
func CreateRoom(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil || user.UserID == "" || user.Username == "" {
		log.Println("[CreateRoom] Invalid user payload")
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Invalid user payload"})
		return
	}

	roomMutex.Lock()
	roomIDCounter++
	rid := roomIDCounter
	room := &Room{
		RoomID:         rid,
		CreatedBy:      user,
		ConnectedUsers: []User{user},
	}
	Rooms[rid] = room
	roomMutex.Unlock()

	log.Printf("[CreateRoom] Room %d created by user %s (%s)\n", rid, user.Username, user.UserID)

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Room created successfully",
		"room": gin.H{
			"id":              rid,
			"created_by":      user.Username,
		},
	})
}

// Function to join the room with room id 
func JoinRoom(c *gin.Context) {
	var joinPayload struct {
		RoomID   int    `json:"roomid"`
		UserID   string `json:"userid"`
		Username string `json:"username"`
	}
	if err := c.ShouldBindJSON(&joinPayload); err != nil || joinPayload.UserID == "" || joinPayload.Username == "" {
		log.Println("[JoinRoom] Invalid join payload")
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Invalid join payload"})
		return
	}

	roomMutex.Lock()
	room, exists := Rooms[joinPayload.RoomID]
	roomMutex.Unlock()
	if !exists {
		log.Printf("[JoinRoom] Room %d does not exist\n", joinPayload.RoomID)
		c.JSON(http.StatusNotFound, gin.H{"error": true, "message": "Room does not exist"})
		return
	}

	room.Mutex.Lock()
	for _, user := range room.ConnectedUsers {
		if user.UserID == joinPayload.UserID {
			room.Mutex.Unlock()
			log.Printf("[JoinRoom] User %s already exists in room %d\n", joinPayload.UserID, joinPayload.RoomID)
			c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "User already exists"})
			return
		}
	}
	newUser := User{UserID: joinPayload.UserID, Username: joinPayload.Username}
	room.ConnectedUsers = append(room.ConnectedUsers, newUser)
	room.Mutex.Unlock()

	log.Printf("[JoinRoom] User %s (%s) joined room %d\n", newUser.Username, newUser.UserID, joinPayload.RoomID)

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "User joined successfully",
		"room_id": joinPayload.RoomID,
		"connected_users": Rooms[joinPayload.RoomID].ConnectedUsers ,
	})
}

// this websocket function will move to seeprate file later on after
// fixing sync logic with mutex or semaphores  
func WebSocketHandler(c *gin.Context) {
	roomidStr := c.Query("roomid")
	userid := c.Query("userid")
	if roomidStr == "" || userid == "" {
		log.Println("[WebSocketHandler] Missing roomid or userid in query")
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Missing roomid or userid in query"})
		return
	}

	roomid, err := strconv.Atoi(roomidStr)
	if err != nil {
		log.Println("[WebSocketHandler] Invalid roomid format")
		c.JSON(http.StatusBadRequest, gin.H{"error": true, "message": "Invalid roomid format"})
		return
	}

	roomMutex.Lock()
	room, exists := Rooms[roomid]
	roomMutex.Unlock()
	if !exists {
		log.Printf("[WebSocketHandler] Room %d not found\n", roomid)
		c.JSON(http.StatusNotFound, gin.H{"error": true, "message": "Room not found"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("[WebSocketHandler] WebSocket upgrade failed:", err)
		return
	}

	log.Printf("[WebSocketHandler] WebSocket connection established for user %s in room %d\n", userid, roomid)
	go handleMessage(WebSocketUser{UserID: userid, Conn: conn}, room)
}

func handleMessage(sender WebSocketUser, room *Room) {
	defer sender.Conn.Close()
	for {
		_, msg, err := sender.Conn.ReadMessage()
		if err != nil {
			log.Printf("[handleMessage] Error from %s: %v\n", sender.UserID, err)
			return
		}

		log.Printf("[handleMessage] Message from %s: %s\n", sender.UserID, string(msg))

		room.Mutex.Lock()
		for _, user := range room.ConnectedUsers {
			if user.UserID != sender.UserID {
				// WebSocket broadcasting placeholder
			}
		}
		room.Mutex.Unlock()
	}
}