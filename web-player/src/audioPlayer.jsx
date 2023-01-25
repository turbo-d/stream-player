import './audioPlayer.css';

import React from 'react';

import PlaybackEngine from './playbackEngine';

import Play from './play';
import PlaybackSlider from './playbackSlider';
import PlaybackTime from './playbackTime';
import RTZ from './rtz';
import TrackArtist from './trackArtist';
import TrackTitle from './trackTitle';

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      seekLocation: 0,
    }

    this.playbackEngine = null;

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
    if ((!prevProps.track && this.props.track) || (prevProps.track && (prevProps.track.id !== this.props.track.id))) {
      console.log("Load");
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
    this.setState((state, props) => ({
      seekLocation: value,
    }));
  }

  handleOnAfterSeek(value, thumbIndex) {
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

    const disableTransport = !this.props.track.isAudioLoaded;

    const seekLocation = this.state.seekLocation;
    const maxSlider = Math.floor(this.props.track.duration);
    const timeElapsed = new Date(1000 * (seekLocation)).toISOString().substring(15, 19);
    const duration = new Date(1000 * (Math.ceil(this.props.track.duration))).toISOString().substring(15, 19);

    return (
      <div className="audioPlayer">
        <div className="audioPlayer__trackData">
          <div className="audioPlayer__trackDataOuter">
            <div className="audioPlayer__trackDataInner">
              <div className="audioPlayer__trackDataTitle">
                <TrackTitle title={this.props.track.title}/>
              </div>
              <div className="audioPlayer__trackDataArtist">
                <TrackArtist artist={this.props.track.artist}/>
              </div>
            </div>
            <div className="audioPlayer__trackDataGradient"/>
          </div>
        </div>
        <div className="audioPlayer__transport">
          <div className="audioPlayer__transportTop">
            <div className="audioPlayer__rtz">
              <RTZ disabled={disableTransport} onRTZ={this.handleRTZ} />
            </div>
            <div className="audioPlayer__play">
              <Play disabled={disableTransport} onPlay={this.handlePlay} onPause={this.handlePause} isPlaying={this.props.track.isPlaying} />
            </div>
          </div>
          <div className="audioPlayer__transportBottom">
            <div className="audioPlayer__playbackTime--left">
              <PlaybackTime playbackTime={timeElapsed} />
            </div>
            <div className="audioPlayer__slider">
              <PlaybackSlider
                min={0}
                max={maxSlider}
                value={seekLocation}
                disabled={disableTransport}
                onBeforeChange={this.handleOnBeforeSeek}
                onChange={this.handleOnSeek}
                onAfterChange={this.handleOnAfterSeek}
              />
            </div>
            <div className="audioPlayer__playbackTime--right">
              <PlaybackTime playbackTime={duration} />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default AudioPlayer;