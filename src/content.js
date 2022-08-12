import { encode, decode } from "./message";
import { API } from "./api";

API.runtime.onConnect.addListener(port => {
  port.onMessage.addListener(async encoded => {
    const message = decode(encoded);

    if (message.type !== 'imageRequest') {
      port.disconnect();
      return;
    }

    const mainImage = document.body.querySelector('img');
    if (!mainImage) {
      port.disconnect();
      return;
    }

    const isImageTab = mainImage.src === window.location.href
      && document.body.children.length === 1
      && document.body.firstElementChild === mainImage;

    if (!isImageTab) {
      port.disconnect();
      return;
    }

    const url = new URL(mainImage.src);
    const name = url.pathname.substring(url.pathname.lastIndexOf('/') + 1);

    const res = await fetch(window.location.href);
    const binary = await res.arrayBuffer();
    const data = new Uint8Array(binary);
    const mime = res.headers.get('Content-Type');

    const response = {
      imageResult: { name, data, mime }
    };

    port.postMessage(encode(response));
  });
});
