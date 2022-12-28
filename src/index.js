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
    if (this.props.isPaused) {
      this.props.onPlay();
    } else {
      this.props.onPause();
    }
  }

  render() {
    const btnText = this.props.isPaused ? "Play" : "Pause";

    return (
      <button onClick={this.handleClick}>
        {btnText}
      </button>
    );
  }
};

class Stop extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onStop()
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Stop
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

class PlaybackProgressBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const containerStyles = {
      height: 20,
      width: '25%',
      backgroundColor: "#e0e0de",
      borderRadius: 50,
      margin: 50
    }
  
    const fillerStyles = {
      height: '100%',
      width: `${this.props.completed}%`,
      backgroundColor: "#6a1b9a",
      borderRadius: 'inherit',
      textAlign: 'right'
    }

    return (
      <div style={containerStyles}>
        <div style={fillerStyles}/>
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
      isPaused: true,
      timeElapsed: new Date(0),
    }

    this.audioCtx = null;
    this.srcBuf = null;
    this.srcNode = null;
    this.isPlaying = false;
    this.timerID = null;
    this.startTime = 0;

    this.handlePlay = this.handlePlay.bind(this);
    this.handleStop = this.handleStop.bind(this);
    this.handlePause = this.handlePause.bind(this);
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
        this.srcBuf = decodedBuffer;
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

    this.setState((state, props) => ({
      timeElapsed: new Date(1000 * (curTime - this.startTime)),
    }));
  }

  handlePlay() {
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().then(() => {
        this.setState((state, props) => ({
          isPaused: false,
        }));

        this.handlePlay()
      });
      return;
    }
    
    if (this.isPlaying) {
      return;
    }

    // Set up the AudioBufferSourceNode
    this.srcNode = new AudioBufferSourceNode(this.audioCtx, {
      buffer: this.srcBuf,
    });

    // Connect the nodes together
    this.srcNode.connect(this.audioCtx.destination);

    this.srcNode.addEventListener(
      "ended",
      () => {
        this.isPlaying = false;
        this.setState((state, props) => ({
          isPaused: true,
          timeElapsed: new Date(0),
        }));
        clearInterval(this.timerID);
        this.srcNode = null;
      },
      false
    )

    if (this.srcNode) {
      this.srcNode.start(0);
      this.isPlaying = true;
      this.startTime = this.audioCtx.currentTime;
      this.setState((state, props) => ({
        isPaused: false,
      }));
      this.timerID = setInterval(
        () => this.tick(),
        100
      );
    }
  }

  handleStop() {
    if (!this.isPlaying) {
      return;
    }

    if (this.srcNode) {
      this.srcNode.stop(0);
      //this.isPlaying = false;
      //this.setState((state, props) => ({
      //  isPaused: true,
      //  timeElapsed: new Date(0),
      //}));
      //clearInterval(this.timerID);
      //this.srcNode = null;
    }
  }

  handlePause() {
    if (!this.audioCtx) {
      return;
    }

    if (this.audioCtx.state === "running") {
      this.audioCtx.suspend().then(() => {
        this.setState((state, props) => ({
          isPaused: true,
        }));
      });
      return;
    } else if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().then(() => {
        this.setState((state, props) => ({
          isPaused: false,
        }));
      });
      return;
    }
  }

  handlePlaybackSliderChange(value, thumbIndex) {
    console.log(value, thumbIndex)
  }

  render() {
    let timeElapsed = "-:--";
    let timeRemaining = "-:--";
    //let completed = 0;
    let maxSlider = 100;
    let timeElapsedSecs = 0;
    let disableThumb = true;

    if (this.srcBuf) {
      timeElapsed = this.state.timeElapsed.toISOString().substring(15, 19);

      const trackLength = this.srcBuf.duration;
      const minElapsed = this.state.timeElapsed.getMinutes();
      const secElapsed = this.state.timeElapsed.getSeconds() + (60 * minElapsed);
      timeElapsedSecs = secElapsed;

      timeRemaining = new Date(1000 * (trackLength - secElapsed)).toISOString().substring(15, 19);

      //completed = 100 * (secElapsed / trackLength);

      maxSlider = Math.floor(trackLength);

      disableThumb = false;
    }

    timeRemaining = "-" + timeRemaining;

    return (
      <div>
        <Stop onStop={this.handleStop}/>
        <Play onPlay={this.handlePlay} onPause={this.handlePause} isPaused={this.state.isPaused}/>
        <PlaybackTime playbackTime={timeElapsed}/>
        <PlaybackTime playbackTime={timeRemaining}/>
        <PlaybackSlider min={0} max={maxSlider} value={timeElapsedSecs} disabled={disableThumb} onChange={this.handlePlaybackSliderChange}/>
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
