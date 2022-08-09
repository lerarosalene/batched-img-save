import React, { useCallback }  from 'react';
import { observer } from 'mobx-react-lite';
import store from './store';

const Image = observer(props => {
  const { id } = props;

  const image = store.imagesById[id];
  const { url } = image;

  const handleNameChange = useCallback(evt => {
    store.changeName(id, evt.target.value);
  }, [id]);

  return (
    <div className="image">
      <div className="image__cover-container">
        <img src={url} className="image__cover" />
      </div>
      <input className="image__name" value={image.name} onChange={handleNameChange} />
    </div>
  );
});

Image.displayName = "Image";

export { Image };
