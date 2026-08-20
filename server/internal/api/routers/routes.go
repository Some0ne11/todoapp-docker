package routers

import (
	"database/sql"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	
	"server/internal/api/handlers"
)

// SetupRouter initializes the chi router with middlewares and route mappings.
func SetupRouter(db *sql.DB) *chi.Mux {
	router := chi.NewRouter()

	// Basic middlewares
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	// CORS configuration
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost", "http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Instantiate the handler
	todoHandler := &handlers.TodoHandler{DB: db}

	// Map routes to handler methods
	router.Get("/health", todoHandler.HealthCheck)
	
	router.Route("/api/todos", func(r chi.Router) {
		r.Get("/", todoHandler.GetTodos)
		r.Post("/", todoHandler.CreateTodo)
		r.Put("/{id}/toggle", todoHandler.ToggleTodo)
		r.Delete("/{id}", todoHandler.DeleteTodo)
	})

	return router
}
