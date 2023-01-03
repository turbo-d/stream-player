import React from 'react';

import Track from './track';

class TrackList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tracks: []
    }
  }

  componentDidMount() {
    const url = "http://localhost:8080/tracks"
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.setState((state, props) => ({
          tracks: data.tracks,
        }));
      })
      .catch((e) => {
        console.error(`Error: ${e}`);
      });
  }

  render() {
    const trackList = this.state.tracks?.map((track) => (
      <Track title={track.title} artist={track.artist} key={track.id}/>
    ));

    return (
      <div className="todoapp stack-large">
        <h2 id="list-heading">
          Tracks
        </h2>
        <ul
          className="todo-list stack-large stack-exception"
          aria-labelledby="list-heading"
        >
          {trackList}
        </ul>
      </div>
    );
  }
}

export default TrackList;