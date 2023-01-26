import './trackList.css';
import React from 'react';
import Track from './track';

class TrackList extends React.Component {
  constructor(props) {
    super(props)

    this.onTrackSelect = this.onTrackSelect.bind(this);
  }

  onTrackSelect(track) {
    this.props.onTrackSelect(track);
  }

  render() {
    const trackList = this.props.tracks?.map((track) => {
      let isLoaded = false;
      let isPlaying = false;
      if (this.props.selectedTrack && this.props.selectedTrack.id === track.id) {
        isLoaded = this.props.selectedTrack.isLoaded;
        isPlaying = this.props.selectedTrack.isPlaying;
      }
      return <Track
                track={track}
                key={track.id}
                isLoaded={isLoaded}
                isPlaying={isPlaying}
                onTrackSelect={this.onTrackSelect}
              />
    });

    return (
      <div className="trackList">
        <ul className="trackList__list">
          {trackList}
        </ul>
      </div>
    );
  }
}

export default TrackList;