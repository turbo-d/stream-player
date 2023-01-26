import './errorDialog.css';
import React from 'react';

class ErrorDialog extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onOk();
  }

  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className="errorDialog__outer">
        <div className="errorDialog__wrapper">
          <div className="errorDialog__inner">
            <div className="errorDialog__title">
              Something went wrong &#128517;
            </div>
            <div className="errorDialog__content">
              You can check your internet connection, but let's be real...it’s probably me.
              One of the backend services may be down or in the process of restarting.
              Please try refreshing the page or checking back later.
            </div>
            <div className="errorDialog__buttonContainer">
              <button className="errorDialog__button" onClick={this.onClick}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ErrorDialog;