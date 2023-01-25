import './app.css';
import AudioPlayer from './audioPlayer';
import React from 'react';
import TrackList from './trackList';

class App extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      // track: {id, title, artist, duration, isPlaying, isLoaded}
      track: null,
      displayLoadingAlert: false,
    }

    this.loadingAlertTimeoutID = null;

    this.onTrackSelect = this.onTrackSelect.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onLoadStart = this.onLoadStart.bind(this);
    this.onLoadEnd = this.onLoadEnd.bind(this);
  }

  onTrackSelect(selectedTrack) {
    if (this.state.track && (selectedTrack.id === this.state.track.id)) {
      return;
    }

    let track = {
      id: selectedTrack.id,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      duration: selectedTrack.duration,
      isPlaying: false,
      isLoaded: false,
    }

    this.setState((state, props) => ({
      track: track,
    }));
  }

  onPlay() {
    let track = this.state.track;
    track.isPlaying = true;
    this.setState((state, props) => ({
      track: track,
    }));
  }

  onPause() {
    let track = this.state.track;
    track.isPlaying = false;
    this.setState((state, props) => ({
      track: track,
    }));
  }

  onLoadStart() {
    this.loadingAlertTimeoutID = setTimeout(
      () => {
        this.setState((state, props) => ({
          displayLoadingAlert: true,
        }));
      },
      500
    );
  }

  onLoadEnd() {
    let track = this.state.track;
    track.isLoaded = true;
    this.setState((state, props) => ({
      track: track,
      displayLoadingAlert: false,
    }));

    clearTimeout(this.loadingAlertTimeoutID);
  }

  render() {
    let headerText = this.state.displayLoadingAlert? "Tracks -- LOADING" : "Tracks";
    return (
      <div className="app">
        <div className="app__header">
          <div className="app__headerTracksBox">
            <h2 className="app__headerTracks">
              {headerText}
            </h2>
          </div>
        </div>
        <div className="app__body">
          <TrackList
            selectedTrack={this.state.track}
            onTrackSelect={this.onTrackSelect}
          />
        </div>
        <div className="app__footer">
          <AudioPlayer
            track={this.state.track}
            onPlay={this.onPlay}
            onPause={this.onPause}
            onLoadStart={this.onLoadStart}
            onLoadEnd={this.onLoadEnd}
          />
        </div>
      </div>
    );
  }
}

export default App;