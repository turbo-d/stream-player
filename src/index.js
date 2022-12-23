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

class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isPaused: true,
    }

    this.audioCtx = null;
    this.srcBuf = null;
    this.srcNode = null;
    this.isPlaying = false;

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
      this.setState((state, props) => ({
        isPaused: false,
      }));
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
      }));
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
    return (
      <div>
        <Stop onStop={this.handleStop}/>
        <Play onPlay={this.handlePlay} onPause={this.handlePause} isPaused={this.state.isPaused}/>
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
