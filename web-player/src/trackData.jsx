import './trackData.css';
import React from 'react';
import TrackArtist from './trackArtist';
import TrackTitle from './trackTitle';

function TrackData(props) {
  return (
    <div className="trackData">
      <div className="trackData__outer">
        <div className="trackData__inner">
          <div className="trackData__title">
            <TrackTitle title={props.track.title}/>
          </div>
          <div className="trackData__artist">
            <TrackArtist artist={props.track.artist}/>
          </div>
        </div>
        <div className="trackData__gradient"/>
      </div>
    </div>
  );
};

export default TrackData;