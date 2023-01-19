##
## Build
##

FROM golang:1.19-buster as builder

WORKDIR /go/src/github.com/turbo-d/stream-player/server

COPY go.* ./
RUN go mod download

COPY . ./

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o build/stream-player/server github.com/turbo-d/stream-player/server


##
## Deploy
##

#FROM --platform=amd64 debian:buster-slim
FROM debian:buster-slim

RUN set -e; \
    apt-get update -y && apt-get install -y \
    curl \
    gnupg2 \
    tini \
    lsb-release; \
    gcsFuseRepo=gcsfuse-`lsb_release -c -s`; \
    echo "deb http://packages.cloud.google.com/apt $gcsFuseRepo main" | \
    tee /etc/apt/sources.list.d/gcsfuse.list; \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    apt-key add -; \
    apt-get update; \
    apt-get install -y gcsfuse \
    && apt-get clean

RUN set -x && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Set fallback mount directory
ENV MNT_DIR /mnt/gcs

WORKDIR /usr/bin/stream-player

COPY ./gcsfuse_run.sh ./
RUN chmod +x ./gcsfuse_run.sh

COPY --from=builder /go/src/github.com/turbo-d/stream-player/server/build/stream-player/server ./

EXPOSE 8080 8080

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"] 

# Pass the startup script as arguments to Tini
CMD ["./gcsfuse_run.sh"]

