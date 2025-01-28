import {contextBridge, ipcRenderer, dialog} from 'electron'
import {MAIN_REQUESTS} from "../shared/Settings";
import {Server} from "socket.io";
import {webUtils} from 'electron'

/*const Downloader = require("nodejs-file-downloader");
const io = new Server();*/


/*io.on('connection', async (socket) => {
  console.log('a user connected');
  socket.on('toelectron2', async (msg) => {
    console.log('Found in electron', msg);
    for (const imagePath of msg.links) {
      const downloadPath = imagePath.path;
      console.log(downloadPath);
      await downloadFile(downloadPath);
    }

  })
})

async function downloadFile(_filepath:string) {
  const downloader = new Downloader({
    url: _filepath,
    directory: "i:\\Transcend\\Incoming Pics\\",
    maxAttempts: 2
  });
  try {
    const {filePath, downloadStatus} = await downloader.download();
    return filePath;
  } catch (error) {
    console.log("Download failed", error);
    return false
  }
}

io.on('disconnect', () => {
  console.log('user disconnected');
});
io.listen(3000);*/


// Expose ipcRenderer to the client
contextBridge.exposeInMainWorld('api', {
  /*  readDirectory: async (directoryPath: File, playerId: string, fileTypes: string[]) => {
      const path = webUtils.getPathForFile(directoryPath);
      return await ipcRenderer.invoke(MAIN_REQUESTS.DRAG_DROP, {path, playerId, fileTypes});
    },*/
  readFiles: async (fileList: File[], playerId: string, fileTypes: string[]) => {
    const allFiles: any = fileList.map((file: File) => {
      return webUtils.getPathForFile(file);
    })
    return await ipcRenderer.invoke(MAIN_REQUESTS.DRAG_DROP_FILES, {allFiles, playerId, fileTypes});
  },
  streamVideo: (mkvFilePath: string) => {
    ipcRenderer.send('start-video-stream', mkvFilePath);
  },
  setVolume: async (_volume: number) => {

    console.log(_volume);
    audioSession.volume = 0.5;
  },
  getWindowsDrives: async () => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.GET_WINDOWS_DRIVES);
  },
  getFilesAndFoldersForPath: async (path: string) => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.GET_FILES_AND_FOLDERS, path);
  },
  openFileBrowser: async (openFileEvent: IOpenFilesEvent) => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.OPEN_FILE_BROWSER, openFileEvent);
  },
  openFolderBrowser: async (openFolderEvent: IOpenFolderEvent) => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.OPEN_FOLDER_BROWSER, openFolderEvent);
  },
  convertFile: async (params: IMediaVideo, shouldDelete: boolean) => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.CONVERT_MEDIA, params, shouldDelete);
  },
  renameFile: async (rootFolder: any, fileList: IMediaImage[], modelName: string, renameStrategy: any, delimiter: string) => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.RENAME_FILE, rootFolder, fileList, modelName, renameStrategy, delimiter);
  },
  deleteFile: async (params: IMediaVideo) => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.DELETE_MEDIA, params);
  },
  saveConfig: async (saveInformation: ISaveFile): Promise<boolean> => {
    return await ipcRenderer.invoke('saveConfig', saveInformation);
  },
  getAppPath: async (): Promise<string> => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.GET_APP_PATH);
  },
  chooseFolder: async (): Promise<string> => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.CHOOSE_FOLDER);
  },
  databaseCall: async (databaseCallId: string, args: any): Promise<any> => {
    return await ipcRenderer.invoke(MAIN_REQUESTS.DATABASE_CALL, databaseCallId, args);
  },
  receive: (channel: string, func: (args: any) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  }
})

