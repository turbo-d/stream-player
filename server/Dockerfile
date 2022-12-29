##
## Build
##

FROM golang:1.14.6-alpine3.12 as builder

WORKDIR /go/src/github.com/turbo-d/stream-player/server

COPY go.mod go.sum /go/src/github.com/turbo-d/stream-player/server/

RUN go mod download

COPY . /go/src/github.com/turbo-d/stream-player/server

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o build/stream-player/server github.com/turbo-d/stream-player/server

##
## Deploy
##

FROM alpine

RUN apk add --no-cache ca-certificates && update-ca-certificates

COPY --from=builder /go/src/github.com/turbo-d/stream-player/server/build/stream-player/server /usr/bin/stream-player/server

EXPOSE 8080 8080

ENTRYPOINT ["/usr/bin/stream-player/server"]
