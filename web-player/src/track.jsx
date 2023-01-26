import './track.css';
import React from 'react';
import NowPlayingIcon from './nowPlayingIcon.jsx';

class Track extends React.Component {
  constructor(props) {
    super(props)

    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
    this.props.onTrackSelect(this.props.track);
  }

  render() {
    let trackIcon = this.props.isLoaded ? <NowPlayingIcon isPlaying={this.props.isPlaying}/> : null;
    let trackTitleContainerClass = this.props.isLoaded ? "track__titleContainer--loaded" : "track__titleContainer";
    let trackTitleClass = this.props.isLoaded ? "track__title--loaded" : "track__title";

    return (
      <li className="track" onClick={this.onClick}>
        <div className="track__highlight">
          <div className="track__data">
            <div className="track__titleWithIcon">
              <div className="track__iconContainer">
                {trackIcon}
              </div>
              <div className={trackTitleContainerClass}> 
                <span className={trackTitleClass}>
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
        </div>
      </li>
    );
  }
}

export default Track;