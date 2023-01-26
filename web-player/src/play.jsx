import './play.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import { faCirclePause } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from './loadingSpinner';


class Play extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    if (this.props.isPlaying) {
      this.props.onPause();
    } else {
      this.props.onPlay();
    }
  }

  render() {
    let btnIcon = this.props.isPlaying ? <FontAwesomeIcon icon={faCirclePause} /> : <FontAwesomeIcon icon={faCirclePlay} />;
    if (this.props.disabled) {
      btnIcon = <LoadingSpinner/>;
    }
    //btnIcon = <FontAwesomeIcon className="play__spinner" icon={faSpinner} />;

    return (
      <button className="play" disabled={this.props.disabled} onClick={this.handleClick}>
        {btnIcon}
      </button>
    );
  }
};

export default Play;