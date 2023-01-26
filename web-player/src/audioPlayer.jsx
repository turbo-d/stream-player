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
    this.onLoadEnd = this.onLoadEnd.bind(this);
    this.onLoadFail = this.onLoadFail.bind(this);
    this.onCursorUpdate = this.onCursorUpdate.bind(this);
    this.onPlaybackStart = this.onPlaybackStart.bind(this);
    this.onPlaybackStop = this.onPlaybackStop.bind(this);
  }

  componentDidMount() {
    this.playbackEngine = new PlaybackEngine();
    this.playbackEngine.addEventListener("onLoadEnd", this.onLoadEnd);
    this.playbackEngine.addEventListener("onLoadFail", this.onLoadFail);
    this.playbackEngine.addEventListener("onPlaybackStart", this.onPlaybackStart);
    this.playbackEngine.addEventListener("onPlaybackStop", this.onPlaybackStop);
    this.playbackEngine.addEventListener("onCursorUpdate", this.onCursorUpdate);
  }

  componentWillUnmount() {
    this.playbackEngine.cleanup();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if ((!prevProps.track && this.props.track) ||
        (prevProps.track && (prevProps.track.id !== this.props.track.id))) {
      const url = `/playback/${this.props.track.id}`;
      this.playbackEngine.load(url, this.props.loadAlertTimeoutMS);
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
    this.playbackEngine.removeEventListener("onCursorUpdate", this.onCursorUpdate);
  }

  onSeek(value, thumbIndex) {
    this.setState((state, props) => ({
      seekLocation: value,
    }));
  }

  onAfterSeek(value, thumbIndex) {
    this.playbackEngine.addEventListener("onCursorUpdate", this.onCursorUpdate);

    this.playbackEngine.seek(value);
  }

  onLoadEnd() {
    this.props.onLoadEnd();
    this.playbackEngine.play();
  }

  onLoadFail() {
    this.props.onLoadFail();
  }

  onPlaybackStart() {
    this.props.onPlaybackStart();
  }

  onPlaybackStop() {
    this.props.onPlaybackStop();
  }

  onCursorUpdate(eventData) {
    this.setState((state, props) => ({
      seekLocation: Math.floor(eventData.value),
    }));
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
            duration={this.props.track.duration}
            isPlaying={this.props.track.isPlaying}
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