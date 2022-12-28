import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactSlider from 'react-slider';
import './index.css';
import reportWebVitals from './reportWebVitals';

class Play extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    if (this.props.isPlaying) {
      this.props.onPause();
    } else {
      this.props.onPlay();
    }
  }

  render() {
    const btnText = this.props.isPlaying ? "Pause" : "Play";

    return (
      <button onClick={this.handleClick}>
        {btnText}
      </button>
    );
  }
};

// RTZ - Return to Zero
class RTZ extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onRTZ()
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        RTZ
      </button>
    );
  }
};

class PlaybackTime extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <p>{this.props.playbackTime}</p>
      </div>
    );
  }
}

function PlaybackSlider(props) {
  return (
    <ReactSlider
      className="customSlider"
      trackClassName="customSlider-track"
      thumbClassName="customSlider-thumb"
      min={props.min}
      max={props.max}
      value={props.value}
      disabled={props.disabled}
      onAfterChange={props.onChange}
    />
  );
}

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      srcBuf:  null,
      isPlaying: false,
      cursor: 0,
    }

    this.audioCtx = null;
    this.srcNode = null;
    this.timerID = null;
    this.lastTime = 0;

    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRTZ = this.handleRTZ.bind(this);
    this.handlePlaybackSliderChange = this.handlePlaybackSliderChange.bind(this);
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

    this.setState((state, props) => ({
      cursor: this.state.cursor + delta,
    }));
  }

  sliceAudioBuffer(buf, start) {
    if (!buf) {
      return null;
    }

    if (start === 0) {
      return buf;
    }

    let srcBufSlice = new AudioBuffer({
      length: buf.length,
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
    
    if (this.state.isPlaying) {
      return;
    }

    let sampleFrame = Math.floor(this.state.cursor * this.audioCtx.sampleRate);
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
        this.setState((state, props) => ({
          isPlaying: false,
        }));
        //clearInterval(this.timerID);
        this.srcNode = null;
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
    // call this.stop function and leave cursor as is


    if (!this.state.isPlaying) {
      return;
    }

    clearInterval(this.timerID);

    if (this.srcNode) {
      this.srcNode.stop(0);
    }
  }

  handleRTZ() {
    // call this.stop function
    // reset cursor to sample frame zero


    if (!this.state.isPlaying) {
      this.setState((state, props) => ({
        cursor: 0,
      }));

      return;
    }

    clearInterval(this.timerID);

    this.setState((state, props) => ({
      cursor: 0,
    }));

    if (this.srcNode) {
      this.srcNode.stop(0);
    }

    // somehow trigger playback again, but after the "ended" event is handled
    //this.handlePlay();
  }

  handlePlaybackSliderChange(value, thumbIndex) {
    console.log(value, thumbIndex)
  }

  render() {
    let timeElapsed = "-:--";
    let timeRemaining = "-:--";

    let sliderVal = 0;
    let maxSlider = 100;
    let disableThumb = true;

    if (this.state.srcBuf) {
      const trackLength = this.state.srcBuf.duration;

      timeElapsed = new Date(1000 * (this.state.cursor)).toISOString().substring(15, 19);
      timeRemaining = new Date(1000 * (trackLength - this.state.cursor)).toISOString().substring(15, 19);

      sliderVal = Math.floor(this.state.cursor);
      maxSlider = Math.floor(trackLength);
      disableThumb = false;
    }

    timeRemaining = "-" + timeRemaining;

    return (
      <div>
        <RTZ onRTZ={this.handleRTZ}/>
        <Play onPlay={this.handlePlay} onPause={this.handlePause} isPlaying={this.state.isPlaying}/>
        <PlaybackTime playbackTime={timeElapsed}/>
        <PlaybackTime playbackTime={timeRemaining}/>
        <PlaybackSlider min={0} max={maxSlider} value={sliderVal} disabled={disableThumb} onChange={this.handlePlaybackSliderChange}/>
      </div>
    );
  }
};

function App() {
  return (
    <div>
      <AudioPlayer/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
