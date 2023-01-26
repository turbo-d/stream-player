import './loadingSpinner.css';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

function LoadingSpinner(props) {
  return (
      <FontAwesomeIcon className="spinner" icon={faSpinner} />
  );
};

export default LoadingSpinner;