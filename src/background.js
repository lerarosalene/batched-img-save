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

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(async data => {
    const message = decode(data);
    if (message.type !== "listRequest") {
      return;
    }

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

    const response = {
      imageList: { images }
    };

    port.postMessage(encode(response));
  });
});

async function handleClicked() {
  await chrome.tabs.create({
    url: chrome.runtime.getURL('ui.html')
  });
}

chrome.action.onClicked.addListener(handleClicked);
