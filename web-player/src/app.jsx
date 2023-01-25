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
    this.onTracksLoadEnd = this.onTracksLoadEnd.bind(this);
    this.onPlaybackLoadEnd = this.onPlaybackLoadEnd.bind(this);
    this.onLoadAlert = this.onLoadAlert.bind(this);
    this.onLoadFail = this.onLoadFail.bind(this);
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

  onTracksLoadEnd() {
    this.setState((state, props) => ({
      showLoadAlert: false,
    }));
  }

  onPlaybackLoadEnd() {
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

    let bodyClass = this.state.track ? "app__body" : "app__body--hidden";
    let footerClass = this.state.track ? "app__footer" : "app__footer--hidden";

    return (
      <div className="app">
        <div className="app__header">
          <div className="app__headerTracksBox">
            <h2 className="app__headerTracks">
              {headerText}
            </h2>
          </div>
        </div>
        <div className={bodyClass}>
          <TrackList
            selectedTrack={this.state.track}
            loadAlertTimeoutMS={500}
            onTrackSelect={this.onTrackSelect}
            onLoadEnd={this.onTracksLoadEnd}
            onLoadAlert={this.onLoadAlert}
            onLoadFail={this.onLoadFail}
          />
        </div>
        <div className={footerClass}>
          <AudioPlayer
            track={this.state.track}
            loadAlertTimeoutMS={500}
            onPlaybackStart={this.onPlaybackStart}
            onPlaybackStop={this.onPlaybackStop}
            onLoadEnd={this.onPlaybackLoadEnd}
            onLoadAlert={this.onLoadAlert}
            onLoadFail={this.onLoadFail}
          />
        </div>
      </div>
    );
  }
}

export default App;