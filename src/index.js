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
    this.props.onPlay()
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Play
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

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.audioCtx = null;
    this.srcBuf = null;
    this.srcNode = null;
    this.isPlaying = false;

    this.handlePlay = this.handlePlay.bind(this);
    this.handleStop = this.handleStop.bind(this);
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

  handlePlay() {
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().then(() => this.handlePlay());
      return;
    }
    
    if (this.isPlaying) {
      return;
    }

    // Set up the AudioBufferSourceNode
    this.srcNode = new AudioBufferSourceNode(this.audioCtx, {
      buffer: this.srcBuf,
      loop: true,
    });

    // Connect the nodes together
    this.srcNode.connect(this.audioCtx.destination);

    if (this.srcNode) {
      this.srcNode.start(0);
      this.isPlaying = true;
    }
  }

  handleStop() {
    if (!this.isPlaying) {
      return;
    }

    if (this.srcNode) {
      this.srcNode.stop(0);
      this.isPlaying = false;
      this.srcNode = null;
    }
  }

  render() {
    return (
      <div>
        <Play onPlay={this.handlePlay}/>
        <Stop onStop={this.handleStop}/>
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
