# Stage 1: Build the Go binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy the go mod files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application
COPY . .

# Build the binary statically
# CGO_ENABLED=0 is perfect here since modernc.org/sqlite is a pure Go driver!
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server ./cmd/server/main.go

# Stage 2: Create a minimal image to run the binary
FROM alpine:latest

# Add ca-certificates in case we need to make outbound HTTPS calls
RUN apk --no-cache add ca-certificates

WORKDIR /app

# We need a data directory for the SQLite database
RUN mkdir -p /app/data

# Copy the built binary from the builder stage
COPY --from=builder /app/server .

# Expose the port the server listens on
EXPOSE 8080

# Run the server
CMD ["./server"]
