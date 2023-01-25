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
      showLoadAlert: false,
      showErrorDialog: false,
    }

    this.onTrackSelect = this.onTrackSelect.bind(this);
    this.onPlaybackStart = this.onPlaybackStart.bind(this);
    this.onPlaybackStop = this.onPlaybackStop.bind(this);
    this.onLoadStart = this.onLoadStart.bind(this);
    this.onLoadEnd = this.onLoadEnd.bind(this);
    this.onLoadAlert = this.onLoadAlert.bind(this);
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

  onPlaybackStart() {
    let track = this.state.track;
    track.isPlaying = true;
    this.setState((state, props) => ({
      track: track,
    }));
  }

  onPlaybackStop() {
    let track = this.state.track;
    track.isPlaying = false;
    this.setState((state, props) => ({
      track: track,
    }));
  }

  onLoadStart() {
  }

  onLoadEnd() {
    let track = this.state.track;
    track.isLoaded = true;
    this.setState((state, props) => ({
      track: track,
      showLoadAlert: false,
    }));
  }

  onLoadAlert() {
    this.setState((state, props) => ({
      showLoadAlert: true,
    }));
  }

  onLoadFail() {
    this.setState((state, props) => ({
      showErrorDialog: true,
    }));
  }

  render() {
    let headerText = this.state.showLoadAlert? "Tracks -- LOADING" : "Tracks";
    if (this.state.showErrorDialog) {
      headerText = "Tracks -- ERROR";
    }

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
            loadAlertTimeoutMS={500}
            onPlaybackStart={this.onPlaybackStart}
            onPlaybackStop={this.onPlaybackStop}
            onLoadStart={this.onLoadStart}
            onLoadEnd={this.onLoadEnd}
            onLoadAlert={this.onLoadAlert}
            onLoadFail={this.onLoadFail}
          />
        </div>
      </div>
    );
  }
}

export default App;