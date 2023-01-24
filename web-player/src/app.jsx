import './app.css';
import React from 'react';
import AudioPlayer from './audioPlayer';
import TrackList from './trackList';
import PlaybackEngine from './playbackEngine';

// track: {id, title, artist, duration, isPlaying, seekLocation, isAudioLoaded}

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentTrack: null,
    }

    this.playbackEngine = null;

    this.handleTrackSelect = this.handleTrackSelect.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRTZ = this.handleRTZ.bind(this);
    this.handleOnBeforeSeek = this.handleOnBeforeSeek.bind(this);
    this.handleOnSeek = this.handleOnSeek.bind(this);
    this.handleOnAfterSeek = this.handleOnAfterSeek.bind(this);

    this.onAudioLoad = this.onAudioLoad.bind(this);
    this.onCursorChange = this.onCursorChange.bind(this);
    this.onPlayStateChange = this.onPlayStateChange.bind(this);
  }

  componentDidMount() {
    this.playbackEngine = new PlaybackEngine();
    this.playbackEngine.addEventListener("onLoad", this.onAudioLoad);
    this.playbackEngine.addEventListener("onCursorUpdate", this.onCursorChange);
    this.playbackEngine.addEventListener("onPlayStateChange", this.onPlayStateChange);
  }

  componentWillUnmount() {
    this.playbackEngine.cleanup();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.currentTrack !== this.state.currentTrack) {
      const url = `/playback/${this.state.currentTrack.id}`;
      fetch(url)
        .then((response) => {
          return response.arrayBuffer()
        })
        .then((downloadedBuffer) => {
          this.playbackEngine.load(downloadedBuffer);
        })
        .catch((e) => {
          console.error(`Error: ${e}`);
        });
    }
  }

  handleTrackSelect(trackMetaData) {
    if (this.state.currentTrack) {
      if (trackMetaData.id === this.state.currentTrack.id) {
        this.playbackEngine.seek(0);
        return;
      }

    }

    let track = {
      id: trackMetaData.id,
      title: trackMetaData.title,
      artist: trackMetaData.artist,
      duration: trackMetaData.duration,
      isPlaying: false,
      seekLocation: 0,
      isAudioLoaded: false,
    }
    this.setState((state, props) => ({
      currentTrack: track,
    }));
  }

  handlePlay() {
    this.playbackEngine.play();
  }

  handlePause() {
    this.playbackEngine.pause();
  }

  handleRTZ() {
    this.playbackEngine.returnToZero();
  }

  handleOnBeforeSeek(value, thumbIndex) {
    this.playbackEngine.removeEventListener("onCursorUpdate", this.onCursorChange);
  }

  handleOnSeek(value, thumbIndex) {
    let currentTrack = this.state.currentTrack;
    currentTrack.seekLocation = value;
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
  }

  handleOnAfterSeek(value, thumbIndex) {
    this.playbackEngine.addEventListener("onCursorUpdate", this.onCursorChange);

    this.playbackEngine.seek(value);
  }

  onCursorChange(eventData) {
    let currentTrack = this.state.currentTrack;
    currentTrack.seekLocation = Math.floor(eventData.value);
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
  }

  onPlayStateChange(eventData) {
    let currentTrack = this.state.currentTrack;
    currentTrack.isPlaying = eventData.isPlaying;
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
  }

  onAudioLoad() {
    console.log("onAudioLoad");
    let currentTrack = this.state.currentTrack;
    currentTrack.isAudioLoaded = true;
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
    this.playbackEngine.play();
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
            onPlay={this.handlePlay}
            onPause={this.handlePause}
            onRTZ={this.handleRTZ}
            onBeforeSeek={this.handleOnBeforeSeek}
            onSeek={this.handleOnSeek}
            onAfterSeek={this.handleOnAfterSeek}
          />
        </div>
      </div>
    );
  }
}

export default App;