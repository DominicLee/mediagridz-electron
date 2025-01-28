import {openDB} from "idb";

interface IStat {
  key: string
  value: number
}

const DB_NAME = 'mediagridz';
const PLAYLISTS = 'playlists';
const LAYOUTS = 'layouts';
const MEDIA = 'media';
const IMAGE = 'image';
const CONVERTER = 'converted';
const SETTINGS = 'settings';
const MODELS = 'models';
const LOGS = 'logs';
const DB_VERSION = 3;

let localDB: any;

export async function initialiseDB(): Promise<void> {
  try {
    localDB = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db: any, oldVersion: any, newVersion: any, transaction: any, event: any) {
        try {
          db.createObjectStore(LOGS)
        } catch (e) {

        }
        try {
          db.createObjectStore(CONVERTER)
        } catch (e) {

        }

        try {
          db.createObjectStore(MEDIA)
        } catch (e) {

        }

        try {
          db.createObjectStore(IMAGE)
        } catch (e) {

        }

        try {
          db.createObjectStore(PLAYLISTS)
        } catch (e) {

        }
        try {
          db.createObjectStore(LAYOUTS)
        } catch (e) {

        }
        try {
          db.createObjectStore(SETTINGS)
        } catch (e) {

        }
        try {
          db.createObjectStore(MODELS)
        } catch (e) {

        }
        return Promise.resolve(true)
      }
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getLogsDownload(): Promise<any> {
  try {
    const logs = await localDB.getAll(LOGS);
    let finalText = '';
    logs.forEach((log: any) => {
      finalText += `${log.timestamp} >>> ${log.log}\n`
    })
    return finalText;
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getPlaylists(): Promise<IPlaylist[]> {
  try {
    const rawPlaylists = await localDB.getAll(PLAYLISTS) as string[]
    const playlists: IPlaylist[] = [];
    for (const playlist of rawPlaylists) {
      playlists.push(JSON.parse(playlist));
    }
    return playlists as IPlaylist[];
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getLayouts(): Promise<ILayout[]> {
  try {
    return await localDB.getAll(LAYOUTS) as ILayout[]
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getMedia(): Promise<IMediaVideo[]> {
  try {
    return await localDB.getAll(MEDIA) as IMediaVideo[]
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getConverted(): Promise<IConverted[]> {
  try {
    return await localDB.getAll(CONVERTER) as IConverted[]
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storeMedia(value: IMediaVideo): Promise<void> {
  try {
    return await localDB.put(MEDIA, value, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storeImage(value: IMediaImage): Promise<void> {
  try {
    return await localDB.put(IMAGE, value, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function updateMedia(value: IMediaVideo): Promise<void> {
  try {
    return await localDB.put(MEDIA, value, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function deleteMedia(value: IMediaVideo): Promise<void> {
  try {
    return await localDB.delete(MEDIA, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function deleteImage(value: IMediaImage): Promise<void> {
  try {
    return await localDB.delete(IMAGE, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storeConverted(value: IConverted): Promise<void> {
  try {
    return await localDB.put(CONVERTER, value, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storePlaylist(value: IPlaylist): Promise<void> {
  try {
    return await localDB.put(PLAYLISTS, JSON.stringify(value), value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storeLayout(value: ILayout): Promise<void> {
  try {
    console.log(value, value.id);
    return await localDB.put(LAYOUTS, JSON.stringify(value), value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storeLog(value: any): Promise<void> {
  try {
    return await localDB.put(LOGS, {log: value}, Date.now());
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function storeModel(value: IModel): Promise<void> {
  try {
    return await localDB.put(MODELS, value, value.id);
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getModels(): Promise<IModel[]> {
  try {
    return await localDB.getAll(MODELS) as IModel[]
  } catch (e) {
    return Promise.reject(e)
  }
}

export async function getModelByName(modelName: string): Promise<IModel[]> {
  try {
    return await localDB.getAll(MODELS).filter((model: IModel) => modelName === model.name)
  } catch (e) {
    return Promise.reject(e)
  }
}
