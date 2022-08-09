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

  const handleDelete = useCallback(() => {
    store.delete(id);
  }, [id]);

  return (
    <div className="image">
      <div className="image__cover-container">
        <div className="image__cover-inner-container">
          <img src={url} className="image__cover" />
          <div className="image__delete-button-container" onClick={handleDelete}>
            <div className="image__delete-button" />
          </div>
        </div>
      </div>
      <input className="image__name" value={image.name} onChange={handleNameChange} />
    </div>
  );
});

Image.displayName = "Image";

export { Image };
