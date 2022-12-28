import React from 'react';

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
    const btnText = this.props.isPlaying ? "Pause" : "Play";

    return (
      <button onClick={this.handleClick}>
        {btnText}
      </button>
    );
  }
};

export default Play;