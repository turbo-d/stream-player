import './trackArtist.css';
import React from 'react';

function TrackArtist(props) {
  return (
    <span className="trackArtist">{props.artist}</span>
  );
}

export default TrackArtist;