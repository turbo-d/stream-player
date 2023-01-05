import React from 'react';
import AudioPlayer from './audioPlayer';
import TrackList from './trackList';

// track: {title, artist, duration, isPlaying, seekLocation, isAudioLoaded}

const StopReason = Object.freeze({
  Undefined: "undefined",
  End: "end",
  Pause: "pause",
  RTZ: "rtz",
  Seek: "seek",
  Switch: "switch",
})

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentTrack: null,
    }

    this.audioCtx = null;
    this.srcBuf = null;
    this.srcNode = null;
    this.cursor = 0;
    this.timerID = null;
    this.lastTime = 0;
    this.stopReason = StopReason.End;
    this.isDragging = false;

    this.handleTrackSelect = this.handleTrackSelect.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleRTZ = this.handleRTZ.bind(this);
    this.handleOnBeforeSeek = this.handleOnBeforeSeek.bind(this);
    this.handleOnSeek = this.handleOnSeek.bind(this);
    this.handleOnAfterSeek = this.handleOnAfterSeek.bind(this);
  }

  componentDidMount() {
    this.audioCtx = new AudioContext();
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
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
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

  handleTrackSelect(trackMetaData) {
    if (this.state.currentTrack) {
      this.handleTrackSwitch();
    }

    let track = {
      title: trackMetaData.title,
      artist: trackMetaData.artist,
      duration: trackMetaData.duration,
      isPlaying: false,
      seekLocation: 0,
      isAudioLoaded: false,
    }
    this.setState((state, props) => ({
      currentTrack: track,
    }));


    const url = "http://localhost:8080/playback/" + trackMetaData.id;
    fetch(url)
      .then((response) => {
        return response.arrayBuffer()
      })
      .then((downloadedBuffer) => {
        return this.audioCtx.decodeAudioData(downloadedBuffer)
      })
      .then((decodedBuffer) => {
        this.srcBuf = decodedBuffer;
        let currentTrack = this.state.currentTrack;
        currentTrack.isAudioLoaded = true;
        this.setState((state, props) => ({
          currentTrack: currentTrack,
        }));
        this.handlePlay();
      })
      .catch((e) => {
        console.error(`Error: ${e}`);
      });
  }

  handlePlay() {
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().then(() => {
        this.handlePlay();
      });
      return;
    }

    let sampleFrame = Math.floor(this.cursor * this.audioCtx.sampleRate);
    let buf = this.sliceAudioBuffer(this.srcBuf, sampleFrame);

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
            let currentTrack = this.state.currentTrack;
            currentTrack.isPlaying = false;
            this.setState((state, props) => ({
              currentTrack: currentTrack,
            }));
            if (!this.isDragging) {
              let currentTrack = this.state.currentTrack;
              currentTrack.seekLocation = Math.floor(this.cursor);
              this.setState((state, props) => ({
                currentTrack: currentTrack,
              }));
            }
            break;
          case StopReason.Pause:
          case StopReason.Switch:
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
      let currentTrack = this.state.currentTrack;
      currentTrack.isPlaying = true;
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));
      this.timerID = setInterval(
        () => this.tick(),
        100
      );
    }
  }

  handlePause() {
    if (!this.state.currentTrack.isPlaying) {
      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      let currentTrack = this.state.currentTrack;
      currentTrack.isPlaying = false;
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      this.stopReason = StopReason.Pause;
      this.srcNode.stop(0);
    }
  }

  handleRTZ() {
    if (!this.state.currentTrack.isPlaying) {
      this.cursor = 0;
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.cursor = 0;
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      this.stopReason = StopReason.RTZ;
      this.srcNode.stop(0);
    }
  }

  handleTrackSwitch() {
    if (!this.state.currentTrack.isPlaying) {
      this.cursor = 0;
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.cursor = 0;
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      this.stopReason = StopReason.Switch;
      this.srcNode.stop(0);
    }
  }

  handleOnBeforeSeek(value, thumbIndex) {
    this.isDragging = true;
  }

  handleOnSeek(value, thumbIndex) {
    let currentTrack = this.state.currentTrack;
    currentTrack.seekLocation = value;
    this.setState((state, props) => ({
      currentTrack: currentTrack,
    }));
  }

  handleOnAfterSeek(value, thumbIndex) {
    this.isDragging = false;

    if (!this.state.currentTrack.isPlaying) {
      this.cursor = value;
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.cursor = value;
      let currentTrack = this.state.currentTrack;
      currentTrack.seekLocation = Math.floor(this.cursor);
      this.setState((state, props) => ({
        currentTrack: currentTrack,
      }));

      this.stopReason = StopReason.Seek;
      this.srcNode.stop(0);
    }
  }

  render() {
    return (
      <div>
        <TrackList onTrackSelect={this.handleTrackSelect}/>
        <AudioPlayer
          track={this.state.currentTrack}
          onPlay={this.handlePlay}
          onPause={this.handlePause}
          onRTZ={this.handleRTZ}
          onBeforeSeek={this.handleOnBeforeSeek}
          onSeek={this.handleOnSeek}
          onAfterSeek={this.handleOnAfterSeek}
        />
      </div>
    );
  }
}

export default App;