import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import store from './store';
import { Image } from './Image';
import { DownloadButton } from './DownloadButton';
import JSZip from 'jszip';
import { findSafeName } from 'src/common';

const App = observer(() => {
  const handleDownload = useCallback(async () => {
    let archive = new JSZip();
    let knownNames = new Set();

    for (let image of store.images) {
      let finalName = findSafeName(image.name, knownNames);
      archive.file(finalName, image.data);
    }

    const content = await archive.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);

    await chrome.downloads.download({
      url: url,
      filename: "archive.zip",
    })
  }, []);

  return (
    <div className="app__list">
      {store.imageIds.map(id => (
        <Image key={id} id={id} />
      ))}
      <DownloadButton onClick={handleDownload} />
    </div>
  );
});

App.displayName = "App";

export { App };
