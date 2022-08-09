import { encode, decode } from "./message";

function handleMessage(data, _, respond) {
  const message = decode(data);

  if (message.type !== 'imageRequest') {
    respond(null);
    return true;
  }

  const mainImage = document.body.querySelector('img');
  if (!mainImage) {
    respond(null);
    return true;
  }

  const isImageTab = mainImage.src === window.location.href
    && document.body.children.length === 1
    && document.body.firstElementChild === mainImage;

  if (!isImageTab) {
    respond(null);
    return true;
  }

  const url = new URL(mainImage.src);
  const name = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);

  (async () => {
    const res = await fetch(window.location.href);
    const binary = await res.arrayBuffer();
    const data = new Uint8Array(binary);
    const mime = res.headers.get('Content-Type');

    const response = {
      imageResult: { name, data, mime }
    };

    respond(encode(response));
  })();

  return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
