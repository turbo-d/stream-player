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
              Unable to Connect
            </div>
            <div className="errorDialog__content">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent aliquet consectetur tortor quis lacinia. Integer vel turpis fringilla, viverra lacus feugiat, euismod lacus. Fusce semper fermentum suscipit.
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