# Modern Todo App (Dockerized)

This repository serves as a **reference guideline** for building, structuring, and Dockerizing a modern full-stack web application. It features a React frontend (Vite + Tailwind CSS), a Go backend (Chi Router), and a local SQLite database, all orchestrated via Docker Compose.

---

## 🏗️ Project Architecture

- **Client:** ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
- **Server:** ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat&logo=sqlite&logoColor=white) `go-chi`
- **Orchestration:** ![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)

---

## 📂 Directory Structure

```text
todoapp-docker/
├── .env                  # (Git-ignored) Contains secrets and injected variables like VITE_API_BASE_URL
├── docker-compose.yml    # Orchestrates the client and server containers, networks, and volumes
├── client/               # Frontend React Application
│   ├── .dockerignore     # Ignores node_modules to speed up Docker context transfer
│   ├── Dockerfile        # Multi-stage Docker build (Node.js -> Nginx)
│   ├── nginx.conf        # Nginx configuration for serving the built SPA
│   ├── package.json      
│   ├── src/              # React source code (App.tsx, hooks, styles)
│   └── vite.config.ts    
└── server/               # Backend Go Application
    ├── Dockerfile        # Multi-stage Docker build (Go Builder -> Alpine)
    ├── go.mod            
    ├── cmd/server/       # Entrypoint (main.go)
    ├── internal/api/     # Modularized Handlers and Routers
    └── data/             # Persistent SQLite database file stored here
```

---

## 🐳 Docker Guidelines & Best Practices

This project uses **Multi-Stage Builds** to keep our final production images as small and secure as possible.

### 1. The Frontend (`client/Dockerfile`)
We split the frontend build into two stages:
* **Stage 1 (Builder):** Uses `node:alpine` to install dependencies and run `pnpm build`. This generates static HTML/JS/CSS files in the `dist` folder.
* **Stage 2 (Production):** Uses a tiny `nginx:alpine` web server. It only copies the compiled static files from Stage 1. **Node.js is completely stripped out of the final image**, drastically reducing its size and eliminating Node.js vulnerabilities in production!
* **Important Note on `.env`:** We don't copy `.env` directly into the image. Instead, we keep `.env` in `.dockerignore` and use Docker Compose `args` combined with `ARG` and `ENV` in the Dockerfile to securely inject environment variables (like `VITE_API_BASE_URL`) at build time.

### 2. The Backend (`server/Dockerfile`)
We also split the backend build:
* **Stage 1 (Builder):** Uses `golang:alpine` to compile our Go code. Because we used `modernc.org/sqlite` (a pure-Go driver without CGO dependencies), we can build a 100% statically linked binary using `CGO_ENABLED=0`.
* **Stage 2 (Production):** Uses a completely blank `alpine` image. We drop the static binary inside it, resulting in a microscopic image size containing nothing but the Go application itself!

### 3. Docker Compose (`docker-compose.yml`)
* **Volumes:** We map `./server/data:/app/data` to persist the SQLite database on your local host machine. This ensures that stopping or destroying the container doesn't delete your Todo list!
* **Variable Interpolation:** Sensitive configuration is loaded from a root `.env` file via `${VITE_API_BASE_URL}`.

---

## 🚀 How to Run the Project

You can run this project either fully containerized with Docker, or natively on your local machine for active development.

### Option 1: Running with Docker (Production-Ready)

**Prerequisites:** Ensure **Docker Desktop** is installed and running.

1. Clone this repository.
2. Create a `.env` file in the **root** directory (`todoapp-docker/.env`) and add:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

**Start the Application:**
```bash
docker-compose up --build -d
```
* Frontend: [http://localhost](http://localhost)
* Backend API: [http://localhost:8080/api](http://localhost:8080/api)

**Helpful Docker Commands:**
* View live logs: `docker-compose logs -f`
* Stop gracefully: `docker-compose down`
* Complete wipe/reset (Warning!): `docker system prune -a --volumes`

---

### Option 2: Running Locally without Docker (Development Mode)

**Prerequisites:** Ensure **Node.js** (v22+), **pnpm**, and **Go** (v1.26+) are installed.

1. **Start the Go Backend:**
   Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   go mod download
   go run cmd/server/main.go
   ```
   *The server will start on port `8080`.*

2. **Start the React Frontend:**
   Open a *second* terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
   Create a `.env` file in the `client` directory (`todoapp-docker/client/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
   Install dependencies and start the Vite dev server:
   ```bash
   pnpm install
   pnpm dev
   ```
   *The frontend will start on [http://localhost:5173](http://localhost:5173).*
