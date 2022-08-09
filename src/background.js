import { decode, encode } from "./message";
import { findSafeName } from "./common";
import { ACTION, API } from "./api";

async function sendTabRequest(tabId) {
  try {
    const message = encode({ imageRequest: true });
    const response = await API.tabs.sendMessage(tabId, message);

    if (!response) {
      return new Error(API.runtime.lastError);
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

API.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(async data => {
    const message = decode(data);
    if (message.type !== "listRequest") {
      return;
    }

    const tabs = await API.tabs.query({ currentWindow: true });

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
  await API.tabs.create({
    url: API.runtime.getURL('ui.html')
  });
}

ACTION.onClicked.addListener(handleClicked);
