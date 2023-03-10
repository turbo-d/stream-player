package handler

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/render"
)

func tracks(router chi.Router) {
	router.Get("/", getAllTracks)
}

func getAllTracks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET")

	tracks, err := dbInstance.GetAllTracks()
	if err != nil {
		render.Render(w, r, ServerErrorRenderer(err))
		return
	}

	if err := render.Render(w, r, tracks); err != nil {
		render.Render(w, r, ErrorRenderer(err))
	}
}
