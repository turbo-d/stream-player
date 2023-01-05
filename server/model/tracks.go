package model

import (
	"net/http"
)

type Track struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Artist      string  `json:"artist"`
	RelLocation string  `json:"rel_location"`
	Duration    float64 `json:"duration"`
}

type TrackList struct {
	Tracks []Track `json:"tracks"`
}

func (t *Track) Bind(r *http.Request) error {
	return nil
}

func (*TrackList) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}

func (*Track) Render(w http.ResponseWriter, r *http.Request) error {
	return nil
}
