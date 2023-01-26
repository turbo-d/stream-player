import './trackListLoader.css';
import LoadingSpinner from './loadingSpinner';
import React from 'react';
import TrackList from './trackList';

class TrackListLoader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: [],
      isLoading: false,
    }

    this.onTrackSelect = this.onTrackSelect.bind(this);
  }

  componentDidMount() {
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
          isLoading: false,
          tracks: data.tracks,
        }));
      })
      .catch((e) => {
        //console.error(`Error: ${e}`);
        this.setState((state, props) => ({
          isLoading: false,
        }));
        this.props.onLoadFail();
      });
  }

  onTrackSelect() {
    this.props.onTrackSelect();
  }

  render() {
    if (this.state.isLoading) {
      const spinner =
        <div className="trackListLoader__spinnerContainer">
          <LoadingSpinner/>
        </div>;
      return spinner;
    }

    return (
        <TrackList
          tracks={this.state.tracks}
          selectedTrack={this.props.selectedTrack}
          onTrackSelect={this.onTrackSelect}
        />
    );
  }
};

export default TrackListLoader;