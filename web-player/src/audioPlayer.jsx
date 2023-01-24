import './audioPlayer.css';

import React from 'react';

import Play from './play';
import PlaybackSlider from './playbackSlider';
import PlaybackTime from './playbackTime';
import RTZ from './rtz';
import TrackArtist from './trackArtist';
import TrackTitle from './trackTitle';

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRTZ = this.handleRTZ.bind(this);
    this.handlePlaybackSliderBeforeChange = this.handlePlaybackSliderBeforeChange.bind(this);
    this.handlePlaybackSliderChange = this.handlePlaybackSliderChange.bind(this);
    this.handlePlaybackSliderAfterChange = this.handlePlaybackSliderAfterChange.bind(this);
  }

  handlePlay() {
    this.props.onPlay();
  }

  handlePause() {
    this.props.onPause();
  }

  handleRTZ() {
    this.props.onRTZ();
  }

  handlePlaybackSliderBeforeChange(value, thumbIndex) {
    this.props.onBeforeSeek(value, thumbIndex);
  }

  handlePlaybackSliderChange(value, thumbIndex) {
    this.props.onSeek(value, thumbIndex);
  }

  handlePlaybackSliderAfterChange(value, thumbIndex) {
    this.props.onAfterSeek(value, thumbIndex);
  }

  render() {
    if (!this.props.track) {
      return null;
    }

    const disableTransport = !this.props.track.isAudioLoaded;

    const seekLocation = this.props.track.seekLocation;
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
                onBeforeChange={this.handlePlaybackSliderBeforeChange}
                onChange={this.handlePlaybackSliderChange}
                onAfterChange={this.handlePlaybackSliderAfterChange}
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