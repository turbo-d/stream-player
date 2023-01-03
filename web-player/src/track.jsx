import React from 'react';

class Track extends React.Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    console.log(this.props.title, " clicked");
  }

  render() {
    return (
      <li className="todo stack-small" onClick={this.handleClick}>
        <div className="c-cb">
          <label className="todo-label" htmlFor="todo-0">
            {this.props.title}
          </label>
        </div>
        <div className="btn-group">
          <label className="todo-label" htmlFor="todo-0">
            {this.props.artist}
          </label>
        </div>
      </li>
    );
  }
}

export default Track;