import './app.css';
import AudioPlayer from './audioPlayer';
import ErrorDialog from './errorDialog';
import React from 'react';
import TrackListLoader from './trackListLoader';

class App extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      // track: {id, title, artist, duration, isPlaying, isLoaded}
      track: null,
      showErrorDialog: false,
    }

    this.audioPlayerRef = React.createRef();

    this.onTrackSelect = this.onTrackSelect.bind(this);
    this.onPlaybackStart = this.onPlaybackStart.bind(this);
    this.onPlaybackStop = this.onPlaybackStop.bind(this);
    this.onTrackLoad = this.onTrackLoad.bind(this);
    this.onLoadFail = this.onLoadFail.bind(this);
    this.onErrorDialogOk = this.onErrorDialogOk.bind(this);
  }

  onTrackSelect(selectedTrack) {
    if (this.state.track && (selectedTrack.id === this.state.track.id)) {
      return;
    }

    // Safari does not allow audio playback unless the playback is initiated
    // as a direct result of a user gesture. We must be in the call stack of
    // the handling of a user gesture (promise chains are not allowed) in 
    // order to successfully enable playback.
    this.audioPlayerRef.current.enablePlayback();

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

  onTrackLoad() {
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
    let bodyClass = this.state.track ? "app__body" : "app__body--hidden";
    let footerClass = this.state.track ? "app__footer" : "app__footer--hidden";

    return (
      <div className="app">
        <ErrorDialog show={this.state.showErrorDialog} onOk={this.onErrorDialogOk}/>
        <div className="app__header">
          <div className="app__headerTracksBox">
            <h2 className="app__headerTracks">
              Tracks
            </h2>
          </div>
        </div>
        <div className={bodyClass}>
          <TrackListLoader
            selectedTrack={this.state.track}
            onTrackSelect={this.onTrackSelect}
            onLoadFail={this.onLoadFail}
          />
        </div>
        <div className={footerClass}>
          <AudioPlayer
            ref={this.audioPlayerRef}
            track={this.state.track}
            onPlaybackStart={this.onPlaybackStart}
            onPlaybackStop={this.onPlaybackStop}
            onLoad={this.onTrackLoad}
            onLoadFail={this.onLoadFail}
          />
        </div>
      </div>
    );
  }
}

export default App;