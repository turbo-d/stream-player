import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { faVolumeOff } from '@fortawesome/free-solid-svg-icons'

class Track extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onTrackSelect(this.props.track);
  }

  render() {
    let loadedIcon = null;
    if (this.props.isLoaded) {
      if (this.props.isPlaying) {
        loadedIcon = <span><FontAwesomeIcon icon={faVolumeHigh}/></span>;
      } else {
        loadedIcon = <span><FontAwesomeIcon icon={faVolumeOff}/></span>;
      }
    }

    return (
      <li className="todo stack-small" onClick={this.handleClick}>
        <div className="c-cb">
          {loadedIcon}
          <span className="todo-label" htmlFor="todo-0">
            {this.props.track.title}
          </span>
        </div>
        <div className="btn-group">
          <label className="todo-label" htmlFor="todo-0">
            {this.props.track.artist}
          </label>
        </div>
      </li>
    );
  }
}

export default Track;