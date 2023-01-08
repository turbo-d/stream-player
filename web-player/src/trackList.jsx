import './trackList.css';
import React from 'react';

import Track from './track';

class TrackList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tracks: []
    }

    this.handleTrackSelect = this.handleTrackSelect.bind(this);
  }

  componentDidMount() {
    const url = "http://localhost:8080/tracks"
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.setState((state, props) => ({
          tracks: data.tracks,
        }));
      })
      .catch((e) => {
        console.error(`Error: ${e}`);
      });
  }

  handleTrackSelect(track) {
    this.props.onTrackSelect(track);
  }

  render() {
    const trackList = this.state.tracks?.map((track) => {
      let isLoaded = false;
      let isPlaying = false;
      if (this.props.currentTrack && this.props.currentTrack.id === track.id) {
        isLoaded = this.props.currentTrack.isAudioLoaded;
        isPlaying = this.props.currentTrack.isPlaying;
      }
      return <Track track={track} key={track.id} isLoaded={isLoaded} isPlaying={isPlaying} onTrackSelect={this.handleTrackSelect}/>
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