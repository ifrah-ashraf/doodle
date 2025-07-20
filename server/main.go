package main

import (
	"log"
	"doodle.io/routes"
	"github.com/gin-gonic/gin"
)

func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func main() {
	r := gin.Default()
	r.Use(gin.Recovery())
	r.Use(CorsMiddleware())

	r.POST("/create", routes.CreateRoom)
	r.POST("/join", routes.JoinRoom)
	r.GET("/ws", routes.WebSocketHandler)

	log.Println("[Server] Running on :8080")
	r.Run(":8080")
}
