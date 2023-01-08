import './play.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
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
    const btnIcon = this.props.isPlaying ? <FontAwesomeIcon icon={faCirclePause} /> : <FontAwesomeIcon icon={faCirclePlay} />;

    return (
      <button className="play" disabled={this.props.disabled} onClick={this.handleClick}>
        {btnIcon}
      </button>
    );
  }
};

export default Play;