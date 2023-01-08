import './track.css';
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
      <li className="track" onClick={this.handleClick}>
        <div className="track__data">
          <div className="track__titleWithIcon">
            <div className="track__iconContainer">
              {loadedIcon}
            </div>
            <div className="track__titleContainer"> 
              <span className="track__title">
                {this.props.track.title}
              </span>
            </div>
          </div>
          <div className="track__artistContainer">
            <span className="track__artist">
              {this.props.track.artist}
            </span>
          </div>
        </div>
      </li>
    );
  }
}

export default Track;