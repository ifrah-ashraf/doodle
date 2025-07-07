package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/gorilla/websocket"
)

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

func CreateRoom() http.HandlerFunc {
	// This function will create a room where users come and play
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse JSON body to get userid and username
		uid := r.URL.Query().Get("userid")
		uname := r.URL.Query().Get("username")
		if uid == "" || uname == "" {
			http.Error(w, "Missing userid or username", http.StatusBadRequest)
			return
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		newUser := User{
			UserID:       uid,
			Username:     uname,
			ConnectionID: conn,
		}
		fmt.Println("New user created, now initializing the room...")

		RoomIdCounter++
		room := Room{
			RoomID:         RoomIdCounter,
			CreatedBy:      newUser,
			ConnectedUsers: []User{newUser},
			CurrentWriter:  conn,
		}
		fmt.Println("Successfully created the room", room)
		Rooms[room.RoomID] = &room

		go handleMessage(newUser, &room)
	}
}

func JoinRoom() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get roomid, userid, and username from URL query parameters
		roomidStr := r.URL.Query().Get("roomid")
		userid := r.URL.Query().Get("userid")
		username := r.URL.Query().Get("username")

		if roomidStr == "" || userid == "" || username == "" {
			http.Error(w, "Missing roomid, userid, or username", http.StatusBadRequest)
			return
		}

		// Convert roomid to int
		var roomid int
		if _, err := fmt.Sscanf(roomidStr, "%d", &roomid); err != nil {
			http.Error(w, "Invalid roomid", http.StatusBadRequest)
			return
		}

		room, isExist := Rooms[roomid]
		if !isExist {
			fmt.Println("Room does not exist")
			http.Error(w, "Room does not exist", http.StatusNotFound)
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
			http.Error(w, "User exists", http.StatusBadRequest)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
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
	http.HandleFunc("/join", JoinRoom())
	http.HandleFunc("/create", CreateRoom())
	log.Fatal(http.ListenAndServe(":8080", nil))
}
