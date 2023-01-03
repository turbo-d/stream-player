package db

import (
	"database/sql"

	"github.com/turbo-d/stream-player/server/model"
)

func (db Database) GetAllTracks() (*model.TrackList, error) {
	list := &model.TrackList{}
	rows, err := db.Conn.Query("SELECT * FROM tracks ORDER BY track_id DESC")
	if err != nil {
		return list, err
	}
	for rows.Next() {
		var track model.Track
		err := rows.Scan(&track.ID, &track.Title, &track.Artist, &track.RelLocation)
		if err != nil {
			return list, err
		}
		list.Tracks = append(list.Tracks, track)
	}
	return list, nil
}

func (db Database) GetTrackById(trackID int) (model.Track, error) {
	track := model.Track{}
	query := `SELECT * FROM tracks WHERE track_id = $1;`
	row := db.Conn.QueryRow(query, trackID)
	switch err := row.Scan(&track.ID, &track.Title, &track.Artist, &track.RelLocation); err {
	case sql.ErrNoRows:
		return track, ErrNoMatch
	default:
		return track, err
	}
}
