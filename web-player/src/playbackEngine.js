const PlaybackEngineEvent = Object.freeze({
  Undefined: "undefined",
  OnLoadStart: "onLoadStart",
  OnLoadEnd: "onLoadEnd",
  OnLoadFail: "onLoadFail",
  OnPlaybackStart: "onPlaybackStart",
  OnPlaybackStop: "onPlaybackStop",
  OnCursorUpdate: "onCursorUpdate",
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
    this.cursorUpdateTimerID = null;
    this.lastTime = 0;
    this.isPlaying = false;
    this.stopReason = StopReason.End;
    this.eventListeners = {};
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
    if (!this.eventListeners[event]) {
      return;
    }
    this.eventListeners[event].forEach(listener => listener(data));
    return true;
  }

  cleanup() {
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  }

  load(url /*String*/, alertTimeoutMS /*number*/) {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    if (this.srcBuf) {
      this.#switchTrack();
    }

    this.dispatchEvent(PlaybackEngineEvent.OnLoadStart, {});
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error: The status is ${response.status}`
          );
        }
        return response.arrayBuffer();
      })
      .then((downloadedBuffer) => {
        return this.audioCtx.decodeAudioData(downloadedBuffer)
      })
      .then((decodedBuffer) => {
        this.srcBuf = decodedBuffer;

        this.dispatchEvent(PlaybackEngineEvent.OnLoadEnd, {});
      })
      .catch((e) => {
        //console.error(`Error: ${e}`);
        this.dispatchEvent(PlaybackEngineEvent.OnLoadFail, {});
      });
  }

  play() {
    //if (this.audioCtx.state === "suspended") {
    //  this.audioCtx.resume().then(() => this.play());
    //  return;
    //}
    //if (this.audioCtx.state === "interrupted" ||
    //    this.audioCtx.state === "suspended") {
    //  this.audioCtx.resume().then(() => {
    //    this.play();
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
            clearInterval(this.cursorUpdateTimerID);

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

      this.cursorUpdateTimerID = setInterval(
        () => this.#tick(),
        100
      );
    }
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }

    this.#setPlayState(false);

    clearInterval(this.cursorUpdateTimerID);
    this.stopReason = StopReason.Pause;
    this.srcNode.stop(0);
  }

  returnToZero() {
    this.#updateCursor(0);

    if (!this.isPlaying) {
      return;
    }

    clearInterval(this.cursorUpdateTimerID);
    this.stopReason = StopReason.RTZ;
    this.srcNode.stop(0);
  }

  seek(value) {
    this.#updateCursor(value);

    if (!this.isPlaying) {
      return;
    }

    clearInterval(this.cursorUpdateTimerID);
    this.stopReason = StopReason.Seek;
    this.srcNode.stop(0);
  }

  #switchTrack() {
    this.#updateCursor(0);

    if (!this.isPlaying) {
      return;
    }

    clearInterval(this.cursorUpdateTimerID);
    this.stopReason = StopReason.Switch;
    this.srcNode.stop(0);
  }

  #updateCursor(value) {
    this.cursor = value;
    this.dispatchEvent(PlaybackEngineEvent.OnCursorUpdate, {value: value});
  }

  #setPlayState(isPlaying) {
    this.isPlaying = isPlaying;
    if (isPlaying) {
      this.dispatchEvent(PlaybackEngineEvent.OnPlaybackStart, {});
    } else {
      this.dispatchEvent(PlaybackEngineEvent.OnPlaybackStop, {});
    }
  }

  #tick() {
    const curTime = this.audioCtx.currentTime;
    const delta = curTime - this.lastTime;
    this.lastTime = curTime;

    this.#updateCursor(this.cursor += delta);
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