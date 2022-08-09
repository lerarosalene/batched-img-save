import JSZip from "jszip";
import { decode, encode } from "./message";

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

function findSafeName(name, knownNames) {
  if (!knownNames.has(name)) {
    knownNames.add(name);
    return name;
  }

  let rexp = /^(.*)(\.[^\.]*)$/;
  let match = name.match(rexp);
  let base, ext;

  if (match) {
    base = match[1];
    ext = match[2];
  } else {
    base = name;
    ext = "";
  }

  let suffixNum = 1;
  while (knownNames.has(createName(base, ext, suffixNum))) {
    suffixNum += 1;
  }

  knownNames.add(createName(base, ext, suffixNum));
  return createName(base, ext, suffixNum);

  function createName(base, ext, suffixNum) {
    return `${base}-${suffixNum}${ext}`;
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
  const interfaceTab = await chrome.tabs.create({
    url: chrome.runtime.getURL('interface.html')
  });
  const tabs = await chrome.tabs.query({ currentWindow: true });

  const responses = await Promise.all(
    tabs.map(tab => sendTabRequest(tab.id))
  );

  const message = {
    imageList: {
      images: responses.map(r => r.imageResult).filter(r => r)
    }
  };

  buffer.add(encode(message));

  // let archive = new JSZip();
  // let knownNames = new Set();
  
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
