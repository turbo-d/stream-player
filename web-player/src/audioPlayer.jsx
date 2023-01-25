import './audioPlayer.css';
import PlaybackEngine from './playbackEngine';
import React from 'react';
import TrackData from './trackData';
import TransportControl from './transportControl';

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      seekLocation: 0,
    }

    this.playbackEngine = null;

    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onRTZ = this.onRTZ.bind(this);
    this.onBeforeSeek = this.onBeforeSeek.bind(this);
    this.onSeek = this.onSeek.bind(this);
    this.onAfterSeek = this.onAfterSeek.bind(this);
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
    if ((!prevProps.track && this.props.track) || (prevProps.track && (prevProps.track.id !== this.props.track.id))) {
      this.props.onLoadStart();
      const url = `/playback/${this.props.track.id}`;
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

  onPlay() {
    this.playbackEngine.play();
  }

  onPause() {
    this.playbackEngine.pause();
  }

  onRTZ() {
    this.playbackEngine.returnToZero();
  }

  onBeforeSeek(value, thumbIndex) {
    this.playbackEngine.removeEventListener("onCursorUpdate", this.onCursorChange);
  }

  onSeek(value, thumbIndex) {
    this.setState((state, props) => ({
      seekLocation: value,
    }));
  }

  onAfterSeek(value, thumbIndex) {
    this.playbackEngine.addEventListener("onCursorUpdate", this.onCursorChange);

    this.playbackEngine.seek(value);
  }

  onCursorChange(eventData) {
    this.setState((state, props) => ({
      seekLocation: Math.floor(eventData.value),
    }));
  }

  onPlayStateChange(eventData) {
    if (eventData.isPlaying) {
      this.props.onPlay();
    } else {
      this.props.onPause();
    }
  }

  onAudioLoad() {
    this.props.onLoadEnd();
    this.playbackEngine.play();
  }

  render() {
    if (!this.props.track) {
      return null;
    }

    const disableTransport = !this.props.track.isLoaded;

    return (
      <div className="audioPlayer">
        <div className="audioPlayer__trackData">
          <TrackData track={this.props.track}/>
        </div>
        <div className="audioPlayer__transport">
          <TransportControl
            disabled={disableTransport}
            track={this.props.track}
            seekLocation={this.state.seekLocation}
            onPlay={this.onPlay}
            onPause={this.onPause}
            onRTZ={this.onRTZ}
            onBeforeSeek={this.onBeforeSeek}
            onSeek={this.onSeek}
            onAfterSeek={this.onAfterSeek}
          />
        </div>
      </div>
    );
  }
};

export default AudioPlayer;