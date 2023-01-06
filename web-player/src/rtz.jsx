import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackwardStep } from '@fortawesome/free-solid-svg-icons'

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
      <button disabled={this.props.disabled} onClick={this.handleClick}>
        <FontAwesomeIcon icon={faBackwardStep} />
      </button>
    );
  }
};

export default RTZ;