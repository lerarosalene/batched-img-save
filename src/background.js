import { decode, encode } from "./message";
import { findSafeName } from "./common";

async function sendTabRequest(tabId) {
  try {
    const message = encode({ imageRequest: true });
    const response = await chrome.tabs.sendMessage(tabId, message);

    if (!response) {
      return new Error(chrome.runtime.lastError);
    }

    const result = decode(response);
    if (result.type !== 'imageResult') {
      return new Error('unexpected result');
    }

    return result;
  } catch (error) {
    return error;
  }
}

class MessageBuffer {
  constructor() {
    this.port = null;
    this.buffer = [];
  }

  setPort(port) {
    this.port = port;
    this.port.onDisconnect.addListener(() => {
      if (this.port === port) {
        this.port = null;
      }
    });
    this.flush();
  }

  add(message) {
    this.buffer.push(message);
    this.flush();
  }

  flush() {
    if (!this.port) {
      return;
    }

    for (let message of this.buffer) {
      this.port.postMessage(message);
    }

    this.buffer = [];
  }
}

const buffer = new MessageBuffer();

chrome.runtime.onConnect.addListener(port => {
  buffer.setPort(port);
});

async function handleClicked() {
  await chrome.tabs.create({
    url: chrome.runtime.getURL('ui.html')
  });
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const responses = await Promise.all(
    tabs.map(tab => sendTabRequest(tab.id))
  );

  let images = [];
  let knownNames = new Set();

  for (let response of responses) {
    if (response.type !== 'imageResult') {
      continue;
    }

    const { name, data, mime } = response.imageResult;
    const finalName = findSafeName(name, knownNames);

    images.push({
      name: finalName,
      mime,
      data
    });
  }

  const message = {
    imageList: { images }
  };

  buffer.add(encode(message));

  // let archive = new JSZip();
  
  // for (let response of responses) {
  //   if (response.type !== 'imageResult') {
  //     continue;
  //   }

  //   const { name, data } = response.imageResult;
  //   const realName = findSafeName(name, knownNames);

  //   archive.file(realName, data);
  // }

  // const result = await archive.generateAsync({ type: "base64" });

  // await chrome.downloads.download({
  //   filename: "archive.zip",
  //   url: `data:application/zip;base64,${result}`,
  // });
}

chrome.action.onClicked.addListener(handleClicked);
