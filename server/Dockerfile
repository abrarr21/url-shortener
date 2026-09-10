FROM golang:1.27-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/worker ./cmd/worker/main.go

# run stage -> [The run stage is the second half of your multi-stage Dockerfile. Its job is to create the small final image that actually runs your Go API]
FROM alpine:3.24

RUN apk add --no-cache ca-certificates

COPY --from=builder /bin/api /bin/api
COPY --from=builder /bin/worker /bin/worker
COPY --from=builder /app/web /app/web

WORKDIR /app

EXPOSE 8080

ENTRYPOINT ["/bin/api"]
