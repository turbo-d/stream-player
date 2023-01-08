import './playbackSlider.css';
import React from 'react';
import ReactSlider from 'react-slider';

function PlaybackSlider(props) {
  return (
    <div className="playbackSlider">
      <div className="playbackSlider__inner">
        <ReactSlider
          className="customSlider"
          trackClassName="customSlider-track"
          thumbClassName={props.disabled ? "customSlider-thumb-hidden" : "customSlider-thumb"}
          min={props.min}
          max={props.max}
          value={props.value}
          disabled={props.disabled}
          onBeforeChange={props.onBeforeChange}
          onChange={props.onChange}
          onAfterChange={props.onAfterChange}
        />
      </div>
    </div>
  );
}

export default PlaybackSlider;