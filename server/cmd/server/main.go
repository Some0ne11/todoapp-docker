package main

import (
	"encoding/json"
	"log"
	"net/http"

	"server/internal/db"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	// Initialize the SQLite database
	// using modernc.org/sqlite driver under the hood in db package
	database, err := db.InitDB("data/todos.db")
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer database.Close()

	// Setting up the chi router
	router := chi.NewRouter()

	// Basic middlewares
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	// CORS configuration
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Simple healthcheck route
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Example route to test the DB connection and return empty JSON array
	router.Get("/api/todos", func(w http.ResponseWriter, r *http.Request) {
		rows, err := database.Query("SELECT id, title, completed, created_at FROM todos")
		if err != nil {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		type Todo struct {
			ID        int    `json:"id"`
			Title     string `json:"title"`
			Completed bool   `json:"completed"`
			CreatedAt string `json:"created_at"`
		}

		var todos []Todo
		for rows.Next() {
			var t Todo
			if err := rows.Scan(&t.ID, &t.Title, &t.Completed, &t.CreatedAt); err != nil {
				http.Error(w, "Error scanning rows", http.StatusInternalServerError)
				return
			}
			todos = append(todos, t)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Error iterating over rows", http.StatusInternalServerError)
			return
		}
		
		if todos == nil {
			todos = []Todo{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(todos)
	})

	router.Post("/api/todos", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Title string `json:"title"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}
		_, err := database.Exec("INSERT INTO todos (title) VALUES (?)", req.Title)
		if err != nil {
			http.Error(w, "Failed to create todo", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	})

	router.Put("/api/todos/{id}/toggle", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		_, err := database.Exec("UPDATE todos SET completed = NOT completed WHERE id = ?", id)
		if err != nil {
			http.Error(w, "Failed to update todo", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	router.Delete("/api/todos/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		_, err := database.Exec("DELETE FROM todos WHERE id = ?", id)
		if err != nil {
			http.Error(w, "Failed to delete todo", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	port := ":8080"
	log.Printf("Server is starting on port %s...", port)
	if err := http.ListenAndServe(port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
