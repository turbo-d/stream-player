import React from 'react';

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
    return (
      <li className="todo stack-small" onClick={this.handleClick}>
        <div className="c-cb">
          <label className="todo-label" htmlFor="todo-0">
            {this.props.track.title}
          </label>
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