import './nowPlayingIcon.css';
import React from 'react';

function NowPlayingIcon(props) {
  let style = {
    animationName: (props.isPlaying ? "barWave" : "unset"),
    animationPlayState: (props.isPlaying ? "running" : "paused"),
  }
  return (
    <div className="nowPlayingIcon">
      <div className="nowPlayingIcon__bar" style={style}></div>
      <div className="nowPlayingIcon__bar" style={style}></div>
      <div className="nowPlayingIcon__bar" style={style}></div>
    </div>
  );
}

export default NowPlayingIcon;
