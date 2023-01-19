##
## Build
##

FROM golang:1.19-alpine as builder

WORKDIR /go/src/github.com/turbo-d/stream-player/server

COPY go.mod go.sum ./

RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o build/stream-player/server github.com/turbo-d/stream-player/server


##
## Deploy
##

FROM alpine

RUN apk add --no-cache ca-certificates && update-ca-certificates
RUN apk add --no-cache tini

# Set fallback mount directory
#ENV MNT_DIR /mnt/gcs

WORKDIR /usr/bin/stream-player

COPY ./gcsfuse_run.sh ./
RUN chmod +x ./gcsfuse_run.sh

COPY --from=builder /go/src/github.com/turbo-d/stream-player/server/build/stream-player/server ./

EXPOSE 8080 8080
#ENTRYPOINT ["/usr/bin/stream-player/server"]

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/sbin/tini", "--"] 

# Pass the startup script as arguments to Tini
CMD ["./gcsfuse_run.sh"]

