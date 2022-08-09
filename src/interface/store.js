import { action, computed, makeObservable, observable } from "mobx";

function* generateId() {
  for (let i = 0; true; ++i)
    yield i;
}

function generateOUrl(data, mime) {
  const blob = new Blob([data], { type: mime });
  return URL.createObjectURL(blob);
}

class Store {
  ids = generateId();

  imageIds = [];
  imagesById = {};

  initialized = false;

  get images() {
    return this.imageIds.map(id => this.imagesById[id]);
  }

  constructor() {
    makeObservable(this, {
      imageIds: observable,
      imagesById: observable,
      initialized: observable,
      images: computed,
      setImages: action.bound,
      changeName: action.bound,
      delete: action.bound,
    });
  }

  setImages(images) {
    this.initialized = true;
    this.imageIds = [];
    this.imagesById = {};

    for (let image of images) {
      let id = this.ids.next().value;

      this.imagesById[id] = {
        data: image.data,
        url: generateOUrl(image.data, image.mime),
        mime: image.mime,
        name: image.name,
        id: id,
      };

      this.imageIds.push(id);
    }
  }

  changeName(id, name) {
    const img = this.imagesById[id];
    if (!img) {
      return;
    }

    img.name = name;
  }

  delete(id) {
    delete this.imagesById[id];
    this.imageIds = this.imageIds.filter(storedId => storedId !== id);
  }
}

export default new Store();
