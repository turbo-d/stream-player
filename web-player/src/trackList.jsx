import './trackList.css';
import React from 'react';
import Track from './track';

class TrackList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tracks: []
    }

    this.onTrackSelect = this.onTrackSelect.bind(this);
  }

  componentDidMount() {
    let loadAlertTimeoutTimerID = setTimeout(
      () => {
        this.props.onLoadAlert();
      },
      this.props.loadAlertTimeoutMS 
    );

    const url = "/tracks"
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error: The status is ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        this.setState((state, props) => ({
          tracks: data.tracks,
        }));

        clearTimeout(loadAlertTimeoutTimerID);
        this.props.onLoadEnd();
      })
      .catch((e) => {
        //console.error(`Error: ${e}`);
        this.props.onLoadFail();
      });
  }

  onTrackSelect(track) {
    this.props.onTrackSelect(track);
  }

  render() {
    const trackList = this.state.tracks?.map((track) => {
      let isLoaded = false;
      let isPlaying = false;
      if (this.props.selectedTrack && this.props.selectedTrack.id === track.id) {
        isLoaded = this.props.selectedTrack.isLoaded;
        isPlaying = this.props.selectedTrack.isPlaying;
      }
      return <Track
                track={track}
                key={track.id}
                isLoaded={isLoaded}
                isPlaying={isPlaying}
                onTrackSelect={this.onTrackSelect}
              />
    });

    return (
      <div className="trackList">
        <ul className="trackList__list">
          {trackList}
        </ul>
      </div>
    );
  }
}

export default TrackList;