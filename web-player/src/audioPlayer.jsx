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
    let seekLocation = 0;
    let maxSlider = 100;
    let disableThumb = true;

    let timeElapsed = "-:--";
    let duration = "-:--";

    let trackTitle = "";
    let trackArtist = "";

    let disableTransport = true;
    let isPlaying = false;

    if (this.props.track) {
      trackTitle = this.props.track.title;
      trackArtist = this.props.track.artist;

      seekLocation = this.props.track.seekLocation;
      maxSlider = Math.floor(this.props.track.duration);
      disableThumb = false;

      timeElapsed = new Date(1000 * (seekLocation)).toISOString().substring(15, 19);
      duration = new Date(1000 * (Math.ceil(this.props.track.duration))).toISOString().substring(15, 19);

      disableTransport = !this.props.track.isAudioLoaded;
      isPlaying = this.props.track.isPlaying;
    }

    return (
      <div>
        <RTZ disabled={disableTransport} onRTZ={this.handleRTZ} />
        <Play disabled={disableTransport} onPlay={this.handlePlay} onPause={this.handlePause} isPlaying={isPlaying} />
        <PlaybackTime playbackTime={timeElapsed} />
        <PlaybackTime playbackTime={duration} />
        <PlaybackSlider
          min={0}
          max={maxSlider}
          value={seekLocation}
          disabled={disableThumb}
          onBeforeChange={this.handlePlaybackSliderBeforeChange}
          onChange={this.handlePlaybackSliderChange}
          onAfterChange={this.handlePlaybackSliderAfterChange}
        />
        <TrackTitle title={trackTitle}/>
        <TrackArtist artist={trackArtist}/>
      </div>
    );
  }
};

export default AudioPlayer;