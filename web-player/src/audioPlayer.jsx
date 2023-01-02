import React from 'react';

import Play from './play';
import PlaybackSlider from './playbackSlider';
import PlaybackTime from './playbackTime';
import RTZ from './rtz';

const StopReason = Object.freeze({
  Undefined: "undefined",
  End: "end",
  Pause: "pause",
  RTZ: "rtz",
  Seek: "seek",
})

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      srcBuf: null,
      isPlaying: false,
      seek: 0,
    }

    this.audioCtx = null;
    this.srcNode = null;
    this.cursor = 0;
    this.timerID = null;
    this.lastTime = 0;
    this.stopReason = StopReason.End;
    this.isDragging = false;

    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRTZ = this.handleRTZ.bind(this);
    this.handlePlaybackSliderBeforeChange = this.handlePlaybackSliderBeforeChange.bind(this);
    this.handlePlaybackSliderChange = this.handlePlaybackSliderChange.bind(this);
    this.handlePlaybackSliderAfterChange = this.handlePlaybackSliderAfterChange.bind(this);
  }

  componentDidMount() {
    this.audioCtx = new AudioContext();

    const url = "http://localhost:8080/";
    fetch(url)
      .then((response) => {
        return response.arrayBuffer()
      })
      .then((downloadedBuffer) => {
        return this.audioCtx.decodeAudioData(downloadedBuffer)
      })
      .then((decodedBuffer) => {
        this.setState((state, props) => ({
          srcBuf: decodedBuffer,
        }));
      })
      .catch((e) => {
        console.error(`Error: ${e}`);
      });
  }

  componentWillUnmount() {
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }

  tick() {
    const curTime = this.audioCtx.currentTime;
    const delta = curTime - this.lastTime;
    this.lastTime = curTime;

    this.cursor += delta;

    if (!this.isDragging) {
      this.setState((state, props) => ({
        seek: Math.floor(this.cursor),
      }));
    }
  }

  sliceAudioBuffer(buf, start) {
    if (!buf) {
      return null;
    }

    if (start === 0) {
      return buf;
    }

    let srcBufSlice = new AudioBuffer({
      length: buf.length - start,
      numberOfChannels: buf.numberOfChannels,
      sampleRate: buf.sampleRate,
    });

    for (let chan = 0; chan < buf.numberOfChannels; chan++) {
      let chanData = buf.getChannelData(chan);
      let chanDataSubarray = chanData.subarray(start, chanData.length);
      srcBufSlice.copyToChannel(chanDataSubarray, chan);
    }

    return srcBufSlice;
  }

  handlePlay() {
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().then(() => {
        this.handlePlay();
      });
      return;
    }

    //if (this.state.isPlaying) {
    //  return;
    //}

    let sampleFrame = Math.floor(this.cursor * this.audioCtx.sampleRate);
    let buf = this.sliceAudioBuffer(this.state.srcBuf, sampleFrame);

    // Set up the AudioBufferSourceNode
    this.srcNode = new AudioBufferSourceNode(this.audioCtx, {
      buffer: buf,
    });

    // Connect the nodes together
    this.srcNode.connect(this.audioCtx.destination);

    this.srcNode.addEventListener(
      "ended",
      () => {
        this.srcNode = null;

        switch (this.stopReason) {
          case StopReason.End:
            clearInterval(this.timerID);
            this.cursor = 0;
            this.setState((state, props) => ({
              isPlaying: false,
            }));
            if (!this.isDragging) {
              this.setState((state, props) => ({
                seek: Math.floor(this.cursor),
              }));
            }
            break;
          case StopReason.Pause:
            break;
          case StopReason.RTZ:
            this.handlePlay();
            break;
          case StopReason.Seek:
            this.handlePlay();
            break;
          default:
            console.error("Unknown StopReason");
        }

        this.stopReason = StopReason.End;
      },
      false
    )

    if (this.srcNode) {
      this.srcNode.start(0);
      this.lastTime = this.audioCtx.currentTime;
      this.setState((state, props) => ({
        isPlaying: true,
      }));
      this.timerID = setInterval(
        () => this.tick(),
        100
      );
    }
  }

  handlePause() {
    if (!this.state.isPlaying) {
      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.setState((state, props) => ({
        isPlaying: false,
      }));

      this.stopReason = StopReason.Pause;
      this.srcNode.stop(0);
    }
  }

  handleRTZ() {
    if (!this.state.isPlaying) {
      this.cursor = 0;
      this.setState((state, props) => ({
        seek: Math.floor(this.cursor),
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.cursor = 0;
      this.setState((state, props) => ({
        seek: Math.floor(this.cursor),
      }));

      this.stopReason = StopReason.RTZ;
      this.srcNode.stop(0);
    }
  }

  handlePlaybackSliderBeforeChange(value, thumbIndex) {
    this.isDragging = true;
  }

  handlePlaybackSliderChange(value, thumbIndex) {
    this.setState((state, props) => ({
      seek: value,
    }));
  }

  handlePlaybackSliderAfterChange(value, thumbIndex) {
    this.isDragging = false;

    if (!this.state.isPlaying) {
      this.cursor = value;
      this.setState((state, props) => ({
        seek: Math.floor(this.cursor),
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.cursor = value;
      this.setState((state, props) => ({
        seek: Math.floor(this.cursor),
      }));

      this.stopReason = StopReason.Seek;
      this.srcNode.stop(0);
    }
  }

  render() {
    let seekLocation = 0;
    let maxSlider = 100;
    let disableThumb = true;

    let timeElapsed = "-:--";
    let duration = "-:--";

    if (this.state.srcBuf) {
      const trackLength = this.state.srcBuf.duration;

      seekLocation = this.state.seek;
      maxSlider = Math.floor(trackLength);
      disableThumb = false;

      timeElapsed = new Date(1000 * (seekLocation)).toISOString().substring(15, 19);
      duration = new Date(1000 * (trackLength)).toISOString().substring(15, 19);
    }

    return (
      <div>
        <RTZ onRTZ={this.handleRTZ} />
        <Play onPlay={this.handlePlay} onPause={this.handlePause} isPlaying={this.state.isPlaying} />
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
      </div>
    );
  }
};

export default AudioPlayer;