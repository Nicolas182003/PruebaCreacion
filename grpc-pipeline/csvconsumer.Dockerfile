FROM golang:alpine AS builder

WORKDIR /app

# Disable CGO for static binary
ENV CGO_ENABLED=0
ENV GOOS=linux
ENV GOARCH=amd64

# Copy go mod records
COPY go.mod go.sum ./
RUN go mod download

# Copy application source code
COPY . .

# Build the consumer binary
RUN go build -o /csvconsumer ./csvconsumer/cmd/csvconsumer/main.go

# Final ultra light image
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /
COPY --from=builder /csvconsumer /csvconsumer

# Port exposed internally
EXPOSE 50051

CMD ["/csvconsumer"]
