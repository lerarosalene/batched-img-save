import React from 'react';
import ReactDOM from 'react-dom/client';
import { decode } from './message';
import { App } from './interface/App';
import store from './interface/store';

const rootNode = document.querySelector('#root');
const root = ReactDOM.createRoot(rootNode);

root.render(<App />);

const port = chrome.runtime.connect();
port.onMessage.addListener(data => {
  const message = decode(data);
  if (message.type !== 'imageList') {
    return;
  }

  console.log(message);
  store.setImages(message.imageList.images);
  return;
});
