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
      showErrorDialog: false,
      isLoadingTracks: true,
    }

    this.onTrackSelect = this.onTrackSelect.bind(this);
    this.onPlaybackStart = this.onPlaybackStart.bind(this);
    this.onPlaybackStop = this.onPlaybackStop.bind(this);
    this.onTracksLoadEnd = this.onTracksLoadEnd.bind(this);
    this.onPlaybackLoadEnd = this.onPlaybackLoadEnd.bind(this);
    this.onLoadFail = this.onLoadFail.bind(this);
    this.onErrorDialogOk = this.onErrorDialogOk.bind(this);
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
      isLoadingTracks: false,
    }));
  }

  onPlaybackLoadEnd() {
    let track = this.state.track;
    track.isLoaded = true;
    this.setState((state, props) => ({
      track: track,
    }));
  }

  onLoadFail() {
    this.setState((state, props) => ({
      showErrorDialog: true,
    }));
  }

  onErrorDialogOk() {
    this.setState((state, props) => ({
      showErrorDialog: false,
    }));
  }

  render() {
    let errorDialog = null;
    if (this.state.showErrorDialog) {
      errorDialog =
        <div className="app__errorDialogOuter">
          <div className="app__errorDialogWrapper">
            <div className="app__errorDialogInner">
              <div className="app__errorDialogTitle">
                Unable to Connect
              </div>
              <div className="app__errorDialogContent">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent aliquet consectetur tortor quis lacinia. Integer vel turpis fringilla, viverra lacus feugiat, euismod lacus. Fusce semper fermentum suscipit.
              </div>
              <div className="app__errorDialogButtonContainer">
                <button className="app__errorDialogButton" onClick={this.onErrorDialogOk}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
    }

    let bodyClass = this.state.track ? "app__body" : "app__body--hidden";
    let footerClass = this.state.track ? "app__footer" : "app__footer--hidden";

    return (
      <div className="app">
        {errorDialog}
        <div className="app__header">
          <div className="app__headerTracksBox">
            <h2 className="app__headerTracks">
              Tracks
            </h2>
          </div>
        </div>
        <div className={bodyClass}>
          <TrackList
            selectedTrack={this.state.track}
            onTrackSelect={this.onTrackSelect}
            onLoadEnd={this.onTracksLoadEnd}
            onLoadFail={this.onLoadFail}
          />
        </div>
        <div className={footerClass}>
          <AudioPlayer
            track={this.state.track}
            onPlaybackStart={this.onPlaybackStart}
            onPlaybackStop={this.onPlaybackStop}
            onLoadEnd={this.onPlaybackLoadEnd}
            onLoadFail={this.onLoadFail}
          />
        </div>
      </div>
    );
  }
}

export default App;