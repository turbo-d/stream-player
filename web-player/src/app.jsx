import './app.css';
import React from 'react';
import AudioPlayer from './audioPlayer';
import TrackList from './trackList';

// track: {id, title, artist, duration, isPlaying, isAudioLoaded}

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentTrack: null,
    }

    this.handleTrackSelect = this.handleTrackSelect.bind(this);

    this.handlePlayStateChange = this.handlePlayStateChange.bind(this);
    this.handleAudioLoad = this.handleAudioLoad.bind(this);
  }

  handleTrackSelect(trackMetaData) {
    if (this.state.currentTrack && (trackMetaData.id === this.state.currentTrack.id)) {
      return;
    }

    let track = {
      id: trackMetaData.id,
      title: trackMetaData.title,
      artist: trackMetaData.artist,
      duration: trackMetaData.duration,
      isPlaying: false,
      isAudioLoaded: false,
    }

    this.setState((state, props) => ({
      currentTrack: track,
    }));
  }

  handlePlayStateChange(isPlaying) {
    let currentTrack = this.state.currentTrack;
    currentTrack.isPlaying = isPlaying;
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
  }

  handleAudioLoad() {
    let currentTrack = this.state.currentTrack;
    currentTrack.isAudioLoaded = true;
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
  }

  render() {
    return (
      <div className="app">
        <div className="app__header">
          <div className="app__headerTracksBox">
            <h2 className="app__headerTracks">
              Tracks
            </h2>
          </div>
        </div>
        <div className="app__body">
          <TrackList currentTrack={this.state.currentTrack} onTrackSelect={this.handleTrackSelect}/>
        </div>
        <div className="app__footer">
          <AudioPlayer
            track={this.state.currentTrack}
            onPlayStateChange={this.handlePlayStateChange}
            onAudioLoad={this.handleAudioLoad}
          />
        </div>
      </div>
    );
  }
}

export default App;