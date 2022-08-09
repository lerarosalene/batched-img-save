import React from 'react';
import ReactDOM from 'react-dom/client';
import { decode, encode } from './message';
import { App } from './interface/App';
import store from './interface/store';

const rootNode = document.querySelector('#root');
const root = ReactDOM.createRoot(rootNode);

root.render(<App />);

function main() {
  const port = chrome.runtime.connect();

  try {
    port.postMessage(encode({ listRequest: true }));
  } catch (error) {
    return;
  }

  port.onMessage.addListener(data => {
    const message = decode(data);
    if (message.type !== 'imageList') {
      return;
    }

    store.setImages(message.imageList.images);
    return;
  });
}

main();
