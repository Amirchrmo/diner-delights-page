# ---- Build stage ----
FROM golang:1.22-alpine AS builder
WORKDIR /src

# Cache dependencies first.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Static build for a small alpine image.
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/bergeerd-api ./cmd/api

# ---- Runtime stage ----
FROM alpine:3.21
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=builder /out/bergeerd-api /app/bergeerd-api
COPY assets/placeholder.svg /app/assets/placeholder.svg

ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/app/bergeerd-api"]
