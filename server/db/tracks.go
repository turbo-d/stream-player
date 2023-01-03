package db

import (
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
