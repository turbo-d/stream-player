import React from 'react';
import ReactDOM from 'react-dom/client';
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
      this.isPlaying = false;
      this.setState((state, props) => ({
        isPaused: true,
        timeElapsed: new Date(0),
      }));
      clearInterval(this.timerID);
      this.srcNode = null;
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

  render() {
    let timeElapsed = "-:--";
    let timeRemaining = "-:--";

    if (this.srcBuf) {
      timeElapsed = this.state.timeElapsed.toISOString().substring(15, 19);

      const trackLength = this.srcBuf.duration;
      const minElapsed = this.state.timeElapsed.getMinutes();
      const secElapsed = this.state.timeElapsed.getSeconds() + (60 * minElapsed);

      timeRemaining = new Date(1000 * (trackLength - secElapsed)).toISOString().substring(15, 19);
    }

    timeRemaining = "-" + timeRemaining;

    return (
      <div>
        <Stop onStop={this.handleStop}/>
        <Play onPlay={this.handlePlay} onPause={this.handlePause} isPaused={this.state.isPaused}/>
        <PlaybackTime playbackTime={timeElapsed}/>
        <PlaybackTime playbackTime={timeRemaining}/>
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
