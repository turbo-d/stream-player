import './trackTitle.css';
import React from 'react';

function TrackTitle(props) {
  return (
    <span className="trackTitle">{props.title}</span>
  );
}

export default TrackTitle;