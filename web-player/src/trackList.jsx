import './trackList.css';
import React from 'react';
import Track from './track';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import './play.css';

class TrackList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tracks: [],
      isLoading: false,
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

    this.setState((state, props) => ({
      isLoading: true,
    }));
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

        this.setState((state, props) => ({
          isLoading: false,
        }));
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

    let loadingIcon = 
      <div className="app__spinnerContainer">
        <FontAwesomeIcon className="play__spinner" icon={faSpinner} />
      </div>;

    let dom = this.state.isLoading ? loadingIcon :
      <div className="trackList">
        <ul className="trackList__list">
          {trackList}
        </ul>
      </div>

    return (
      <div>
        {dom}
      </div>
    );
  }
}

export default TrackList;