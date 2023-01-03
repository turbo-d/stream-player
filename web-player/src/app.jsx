import React from 'react';
import AudioPlayer from './audioPlayer';
import TrackList from './trackList';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentTrack: null,
    }

    this.handleTrackSelect = this.handleTrackSelect.bind(this);
  }

  handleTrackSelect(track) {
    //console.log("selected ", track);
    this.setState((state, props) => ({
      currentTrack: track,
    }));
  }

  render() {
    return (
      <div>
        <TrackList onTrackSelect={this.handleTrackSelect}/>
        <AudioPlayer track={this.state.currentTrack}/>
      </div>
    );
  }
}

export default App;