package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
	"github.com/turbo-d/stream-player/server/db"
)

var trackIDKey = "trackID"

func playback(router chi.Router) {
	router.Route("/{trackID}", func(router chi.Router) {
		router.Use(TrackContext)
		router.Get("/", play)
	})
}

func TrackContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		trackID := chi.URLParam(r, "trackID")
		if trackID == "" {
			render.Render(w, r, ErrorRenderer(fmt.Errorf("track ID is required")))
			return
		}
		id, err := strconv.Atoi(trackID)
		if err != nil {
			render.Render(w, r, ErrorRenderer(fmt.Errorf("invalid track ID")))
		}
		ctx := context.WithValue(r.Context(), trackIDKey, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func play(w http.ResponseWriter, r *http.Request) {
	trackID := r.Context().Value(trackIDKey).(int)
	track, err := dbInstance.GetTrackById(trackID)
	if err != nil {
		if err == db.ErrNoMatch {
			render.Render(w, r, ErrNotFound)
		} else {
			render.Render(w, r, ErrorRenderer(err))
		}
		return
	}

	w.Header().Set("Content-Type", "audio/basic")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")

	audioFilesDir, ok := os.LookupEnv("MNT_DIR")
	if !ok {
		audioFilesDir = "/go/src/github.com/turbo-d/stream-player/audio-files"
	}

	filepath := audioFilesDir + "/" + track.RelLocation
	content, err := os.ReadFile(filepath)
	if err != nil {
		render.Render(w, r, ErrorRenderer(err))
	}
	_, err = w.Write(content)
	if err != nil {
		render.Render(w, r, ErrorRenderer(err))
	}
}
