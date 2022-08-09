import React from 'react';

function DownloadButton(props) {
  const { onClick } = props;

  return (
    <div className="download-button" onClick={onClick}>
      <div className="download-button__icon" />
      <span className="download-button__text">download your archive</span>
    </div>
  );
}

export { DownloadButton };