import React from 'react';

// RTZ - Return to Zero
class RTZ extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onRTZ()
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        RTZ
      </button>
    );
  }
};

export default RTZ;