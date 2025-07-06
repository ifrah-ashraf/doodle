package main

import (
	"fmt"
	"log"
	"net/http"
	"encoding/json"
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
		type ReqBody struct {
			UserID   string `json:"userid"`
			Username string `json:"username"`
		}
		var req ReqBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}
		newUser := User{
			UserID:       req.UserID,
			Username:     req.Username,
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
	}
}

func JoinRoom() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse roomid from URL query
		roomIDs, ok := r.URL.Query()["roomid"]
		if !ok || len(roomIDs[0]) < 1 {
			http.Error(w, "Missing roomid in URL", http.StatusBadRequest)
			return
		}
		var roomid int
		_, err := fmt.Sscanf(roomIDs[0], "%d", &roomid)
		if err != nil {
			http.Error(w, "Invalid roomid", http.StatusBadRequest)
			return
		}

		// Parse JSON body to get userid and username
		type ReqBody struct {
			UserID   string `json:"userid"`
			Username string `json:"username"`
		}
		var req ReqBody
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}

		room, isExist := Rooms[roomid]
		if !isExist {
			http.Error(w, "Room does not exist", http.StatusNotFound)
			return
		}

		isUserExist := false
		for _, user := range room.ConnectedUsers {
			if user.UserID == req.UserID {
				isUserExist = true
				break
			}
		}

		if !isUserExist {
			newUser := User{
				UserID:       req.UserID,
				Username:     req.Username,
				ConnectionID: conn,
			}
			room.ConnectedUsers = append(room.ConnectedUsers, newUser)
			fmt.Println("New user added")
		} else {
			fmt.Println("User already exists in the room")
		}
	}
}


func main() {
	http.HandleFunc("/join" ,JoinRoom())
	http.HandleFunc("/create", CreateRoom())
	log.Fatal(http.ListenAndServe(":8080", nil))
}
