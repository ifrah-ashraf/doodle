package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// change this to generate secure room id 
var RoomIdCounter = 0

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type User struct {
	UserID       string `json:"userid"`
	Username     string `json:"username"`
	ConnectionID *websocket.Conn
}
type Room struct {
	RoomID         int `json:"roomid"`
	CreatedBy      User
	ConnectedUsers []User
	CurrentWriter  *websocket.Conn
}

var Rooms = make(map[int]*Room)

// This function will create a room where users come and play
// Parse JSON body to get userid and username
func CreateRoom(c *gin.Context) {
	uid := c.Query("userid")
	uname := c.Query("username")

	if uid == "" || uname == "" {
		log.Println("[CreateRoom] Missing parameter: userid or username")
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Missing required parameters: userid or username",
		})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[CreateRoom] WebSocket upgrade failed: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to upgrade to WebSocket",
		})
		return
	}

	newUser := User{
		UserID:       uid,
		Username:     uname,
		ConnectionID: conn,
	}

	RoomIdCounter++
	room := Room{
		RoomID:         RoomIdCounter,
		CreatedBy:      newUser,
		ConnectedUsers: []User{newUser},
		CurrentWriter:  conn,
	}
	Rooms[room.RoomID] = &room

	log.Printf("[CreateRoom] Room %d created by user %s\n", room.RoomID, newUser.Username)

	c.JSON(http.StatusOK, gin.H{
		"message": "Room created successfully",
		"room": gin.H{
			"id":         room.RoomID,
			"created_by": newUser.Username,
		},
	})

	go handleMessage(newUser, &room)
}

// To help users to join a particular room .
func JoinRoom(c *gin.Context) {
	// Get roomid, userid, and username from URL query parameters
	roomidStr := c.Query("roomid")
	userid := c.Query("userid")
	username := c.Query("username")

	if roomidStr == "" || userid == "" || username == "" {
		log.Println("one of the parameter is missing in request userid , username , roomid")
		c.JSON(http.StatusBadRequest, gin.H{"error": "one of the parameter is missing in request userid , username , roomid"})
		return
	}

	// Convert roomid to int
	var roomid int
	if _, err := fmt.Sscanf(roomidStr, "%d", &roomid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid roomid"})
		return
	}

	room, isExist := Rooms[roomid]
	if !isExist {
		fmt.Println("Room does not exist")
		c.JSON(http.StatusNotFound, gin.H{"error": "Room does not exist"})
		return
	}

	isUserExist := false
	for _, user := range room.ConnectedUsers {
		if user.UserID == userid {
			isUserExist = true
			break
		}
	}

	if isUserExist {
		fmt.Println("User already exist")
		c.JSON(http.StatusBadRequest, gin.H{"error": "User exists"})
		return
	}

	// Use Gin's context to get the underlying ResponseWriter and Request
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err)
		return
	}

	if !isUserExist {
		newUser := User{
			UserID:       userid,
			Username:     username,
			ConnectionID: conn,
		}
		room.ConnectedUsers = append(room.ConnectedUsers, newUser)
		go handleMessage(newUser, room)
		fmt.Println("New user added")
	}
}

func handleMessage(u User, room *Room) {
	userConnection := u.ConnectionID
	for {
		_, msg, err := userConnection.ReadMessage()
		if err != nil {
			log.Println("There is error while receiving the message", err)
			return
		}
		fmt.Println("message receuved from ", u.Username, " and message is ", string(msg))

		for _, receiver := range room.ConnectedUsers {
			if receiver.UserID != u.UserID {
				receiver.ConnectionID.WriteMessage(websocket.TextMessage, msg)
			}
		}

	}
}

func main() {
	router := gin.Default()
	router.Use(gin.Recovery())
	router.Use(CorsMiddleware())

	router.GET("/join",JoinRoom)
	router.GET("/create", CreateRoom)
	router.Run()
}

func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")

		//c.Writer.Header().Set("Content-Type", "application/json")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}