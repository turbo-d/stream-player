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
      srcBuf:  null,
      isPlaying: false,
      //cursor: 0,
      sliderVal: 0,
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
    fetch("Audiorezout-Resurgence.mp3")
      .then((response) => response.arrayBuffer())
      .then((downloadedBuffer) =>
        this.audioCtx.decodeAudioData(downloadedBuffer)
      )
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
        //cursor: this.state.cursor + delta,
        sliderVal: Math.floor(this.cursor),
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

    //let sampleFrame = Math.floor(this.state.cursor * this.audioCtx.sampleRate);
    let sampleFrame = Math.floor(this.cursor * this.audioCtx.sampleRate);
    //console.log(sampleFrame);
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
              //cursor: 0,
              sliderVal: Math.floor(this.cursor),
            }));
            break;
          case StopReason.Pause:
            //this.setState((state, props) => ({
            //  isPlaying: false,
            //}));
            break;
          case StopReason.RTZ:
            //this.setState((state, props) => ({
            //  cursor: 0,
            //}));
            this.handlePlay();
            break;
          case StopReason.Seek:
            //this.setState((state, props) => ({
            //  cursor: 0,
            //}));
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
        //cursor: 0,
        sliderVal: Math.floor(this.cursor),
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);
      
      this.cursor = 0;
      this.setState((state, props) => ({
        //cursor: 0,
        sliderVal: Math.floor(this.cursor),
      }));

      this.stopReason = StopReason.RTZ;
      this.srcNode.stop(0);
    }
  }

  handlePlaybackSliderBeforeChange(value, thumbIndex) {
    this.isDragging = true;
  }

  handlePlaybackSliderChange(value, thumbIndex) {
    //console.log(value, thumbIndex)
    this.setState((state, props) => ({
      sliderVal: value,
    }));
  }

  handlePlaybackSliderAfterChange(value, thumbIndex) {
    //console.log(value, thumbIndex)

    this.isDragging = false;

    if (!this.state.isPlaying) {
      this.cursor = value;
      this.setState((state, props) => ({
        //cursor: value,
        sliderVal: Math.floor(this.cursor),
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.cursor = value;
      this.setState((state, props) => ({
        //cursor: value,
        sliderVal: Math.floor(this.cursor),
      }));
      
      this.stopReason = StopReason.Seek;
      this.srcNode.stop(0);
    }
  }

  render() {
    let sliderVal = 0;
    let maxSlider = 100;
    let disableThumb = true;

    let timeElapsed = "-:--";
    let duration = "-:--";

    if (this.state.srcBuf) {
      const cursor = this.state.cursor;
      const trackLength = this.state.srcBuf.duration;

      //sliderVal = Math.floor(cursor);
      sliderVal = this.state.sliderVal;
      maxSlider = Math.floor(trackLength);
      disableThumb = false;

      timeElapsed = new Date(1000 * (sliderVal)).toISOString().substring(15, 19);
      duration = new Date(1000 * (trackLength)).toISOString().substring(15, 19);
    }

    return (
      <div>
        <RTZ onRTZ={this.handleRTZ}/>
        <Play onPlay={this.handlePlay} onPause={this.handlePause} isPlaying={this.state.isPlaying}/>
        <PlaybackTime playbackTime={timeElapsed}/>
        <PlaybackTime playbackTime={duration}/>
        <PlaybackSlider
          min={0}
          max={maxSlider}
          value={sliderVal}
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