import './transportControl.css';
import Play from './play';
import PlaybackSlider from './playbackSlider';
import PlaybackTime from './playbackTime';
import React from 'react';
import RTZ from './rtz';

class TransportControl extends React.Component {
  constructor(props) {
    super(props);

    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.onRTZ = this.onRTZ.bind(this);
    this.onBeforeSeek = this.onBeforeSeek.bind(this);
    this.onSeek = this.onSeek.bind(this);
    this.onAfterSeek = this.onAfterSeek.bind(this);
  }

  onPlay() {
    this.props.onPlay();
  }

  onPause() {
    this.props.onPause();
  }

  onRTZ() {
    this.props.onRTZ();
  }

  onBeforeSeek(value, thumbIndex) {
    this.props.onBeforeSeek(value, thumbIndex);
  }

  onSeek(value, thumbIndex) {
    this.props.onSeek(value, thumbIndex);
  }

  onAfterSeek(value, thumbIndex) {
    this.props.onAfterSeek(value, thumbIndex);
  }

  render() {
    const seekLocation = this.props.seekLocation;
    const maxSlider = Math.floor(this.props.track.duration);
    const timeElapsed = new Date(1000 * (seekLocation)).toISOString().substring(15, 19);
    const duration = new Date(1000 * (Math.ceil(this.props.track.duration))).toISOString().substring(15, 19);

    return (
      <div className="transportControl">
        <div className="transportControl__top">
          <div className="transportControl__rtz">
            <RTZ
              disabled={this.props.disabled}
              onRTZ={this.onRTZ}
            />
          </div>
          <div className="transportControl__play">
            <Play
              disabled={this.props.disabled}
              isPlaying={this.props.track.isPlaying}
              onPlay={this.onPlay}
              onPause={this.onPause}
            />
          </div>
        </div>
        <div className="transportControl__bottom">
          <div className="transportControl__playbackTime--left">
            <PlaybackTime playbackTime={timeElapsed} />
          </div>
          <div className="transportControl__slider">
            <PlaybackSlider
              min={0}
              max={maxSlider}
              value={seekLocation}
              disabled={this.props.disabled}
              onBeforeChange={this.onBeforeSeek}
              onChange={this.onSeek}
              onAfterChange={this.onAfterSeek}
            />
          </div>
          <div className="transportControl__playbackTime--right">
            <PlaybackTime playbackTime={duration} />
          </div>
        </div>
      </div>
    );
  }
};

export default TransportControl;