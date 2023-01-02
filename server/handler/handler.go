package handler

import (
	"net/http"
	"os"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

func NewHandler() http.Handler {
	router := chi.NewRouter()
	router.MethodNotAllowed(methodNotAllowedHandler)
	router.NotFound(notFoundHandler)
	router.Get("/", getMP3)
	return router
}

func methodNotAllowedHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(405)
	render.Render(w, r, ErrMethodNotAllowed)
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-type", "application/json")
	w.WriteHeader(400)
	render.Render(w, r, ErrNotFound)
}

func getMP3(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-type", "audio/basic")

	content, err := os.ReadFile("/go/src/github.com/turbo-d/stream-player/audio-files/Audiorezout-Resurgence.mp3")
	if err != nil {
		render.Render(w, r, ErrorRenderer(err))
	}
	_, err = w.Write(content)
	if err != nil {
		render.Render(w, r, ErrorRenderer(err))
	}
}
