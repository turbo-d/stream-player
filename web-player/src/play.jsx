import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons'
import { faPause } from '@fortawesome/free-solid-svg-icons'


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
    const btnIcon = this.props.isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faCirclePlay} />;

    return (
      <button disabled={this.props.disabled} onClick={this.handleClick}>
        {btnIcon}
      </button>
    );
  }
};

export default Play;