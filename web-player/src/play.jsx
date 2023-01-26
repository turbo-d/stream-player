import './play.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faCirclePause } from '@fortawesome/free-solid-svg-icons'


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
      btnIcon = <FontAwesomeIcon className="play__spinner" icon={faSpinner} />;
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