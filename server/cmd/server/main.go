package main

import (
	"log"
	"net/http"

	"server/internal/api/routers"
	"server/internal/db"
)

func main() {
	// Initialize the SQLite database
	database, err := db.InitDB("data/todos.db")
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer database.Close()

	// Setup all routes and middlewares via the routers package
	router := routers.SetupRouter(database)

	port := ":8080"
	log.Printf("Server is starting on port %s...", port)
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
