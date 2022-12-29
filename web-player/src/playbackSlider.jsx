import React from 'react';
import ReactSlider from 'react-slider';

function PlaybackSlider(props) {
  return (
    <ReactSlider
      className="customSlider"
      trackClassName="customSlider-track"
      thumbClassName="customSlider-thumb"
      min={props.min}
      max={props.max}
      value={props.value}
      disabled={props.disabled}
      onBeforeChange={props.onBeforeChange}
      onChange={props.onChange}
      onAfterChange={props.onAfterChange}
    />
  );
}

export default PlaybackSlider;