const PlaybackEngineEvent = Object.freeze({
  Undefined: "undefined",
  OnLoad: "onLoad",
  OnCursorUpdate: "onCursorUpdate",
  OnPlayStateChange: "onPlayStateChange",
});

const StopReason = Object.freeze({
  Undefined: "undefined",
  End: "end",
  Pause: "pause",
  RTZ: "rtz",
  Seek: "seek",
  Switch: "switch",
});

class PlaybackEngine extends EventTarget{
  constructor() {
    super();

    this.audioCtx = null;
    this.srcBuf = null;
    this.srcNode = null;
    this.cursor = 0;
    this.timerID = null;
    this.lastTime = 0;
    this.isPlaying = false;
    this.stopReason = StopReason.End;

    this.eventListeners = {};

    this.state = {
      isAudioLoaded: false,
    }
  }

  //addEventListener(type, listener, options) {
  //  this.addEventListener(type, listener);
  //}

  //addEventListener(type, listener, useCapture) {
  //  this.addEventListener(type, listener);
  //}

  addEventListener(type /*PlaybackEngineEvent*/, listener /*func*/) {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }
    this.eventListeners[type].push(listener);
  }

  //removeEventListener(type, listener, options) {
  //  this.removeEventListener(type, listener);
  //}

  //removeEventListener(type, listener, useCapture) {
  //  this.removeEventListener(type, listener);
  //}

  removeEventListener(type /*PlaybackEngineEvent*/, listener /*func*/) {
    if (!this.eventListeners[type]) {
      return;
    }
    for (let i = this.eventListeners[type].length - 1; i >= 0; i--) {
      if (this.eventListeners[type][i] === listener) { 
          this.eventListeners[type].splice(i, 1);
      }
    }
  }

  dispatchEvent(event, data) {
    this.eventListeners[event].forEach(listener => listener(data));
    return true;
  }

  init() {

  }

  cleanup() {
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }

  load(audio /*ArrayBuffer*/) {
    console.log("PE load()");
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    if (this.srcBuf) {
      this.#handleTrackSwitch();
    }

    this.audioCtx.decodeAudioData(audio)
      .then((decodedBuffer) => {
        this.srcBuf = decodedBuffer;
        //this.play();
        this.dispatchEvent(PlaybackEngineEvent.OnLoad, {})
      })
      .catch((e) => {
        console.error(`Error: ${e}`);
      });
  }

  play() {
    //if (this.audioCtx.state === "suspended") {
    //  this.audioCtx.resume().then(() => {
    //    this.handlePlay();
    //  });
    //  return;
    //}

    let sampleFrame = Math.floor(this.cursor * this.audioCtx.sampleRate);
    let buf = this.#sliceAudioBuffer(this.srcBuf, sampleFrame);

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

            this.#updateCursor(0);
            
            this.#setPlayState(false);
            break;
          case StopReason.Pause:
          case StopReason.Switch:
            break;
          case StopReason.RTZ:
            this.play();
            break;
          case StopReason.Seek:
            this.play();
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

      this.#setPlayState(true);

      this.timerID = setInterval(
        () => this.#tick(),
        100
      );
    }
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.#setPlayState(false);

      this.stopReason = StopReason.Pause;
      this.srcNode.stop(0);
    }
  }

  returnToZero() {
    if (!this.isPlaying) {
      this.#updateCursor(0);

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.#updateCursor(0);

      this.stopReason = StopReason.RTZ;
      this.srcNode.stop(0);
    }
  }

  seek(value) {
    if (!this.isPlaying) {
      this.#updateCursor(value);

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.#updateCursor(value);

      this.stopReason = StopReason.Seek;
      this.srcNode.stop(0);
    }
  }

  #handleTrackSwitch() {
    if (!this.isPlaying) {
      this.#updateCursor(0);

      return;
    }

    if (this.srcNode) {
      clearInterval(this.timerID);

      this.#updateCursor(0);

      this.stopReason = StopReason.Switch;
      this.srcNode.stop(0);
    }
  }

  #tick() {
    const curTime = this.audioCtx.currentTime;
    const delta = curTime - this.lastTime;
    this.lastTime = curTime;

    this.#updateCursor(this.cursor += delta);
  }

  #updateCursor(value) {
    this.cursor = value;
    this.dispatchEvent(PlaybackEngineEvent.OnCursorUpdate, {value: value});
  }

  #setPlayState(isPlaying) {
    this.isPlaying = isPlaying;
    this.dispatchEvent(PlaybackEngineEvent.OnPlayStateChange, {isPlaying: isPlaying});
  }

  #sliceAudioBuffer(buf, start) {
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
};

export default PlaybackEngine;