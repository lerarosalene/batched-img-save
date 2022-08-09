import { observer } from 'mobx-react-lite';
import React from 'react';
import store from './store';
import { Image } from './Image';

const App = observer(() => {
  return (
    <div className="app__list">
      {store.imageIds.map(id => (
        <Image key={id} id={id} />
      ))}
    </div>
  );
});

App.displayName = "App";

export { App };
