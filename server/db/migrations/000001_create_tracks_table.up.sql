CREATE TABLE IF NOT EXISTS tracks(
    track_id INT GENERATED ALWAYS AS IDENTITY,
    track_title VARCHAR(100) NOT NULL,
    track_artist VARCHAR(100) NOT NULL,
    rel_location VARCHAR(100) NOT NULL,

    PRIMARY KEY (track_id)
);