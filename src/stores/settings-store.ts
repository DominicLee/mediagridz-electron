import {defineStore} from 'pinia';
import {SORT_BY} from "../../shared/Settings";

enum CursorMode {
  Move = 'move',
  Audio = 'audio',
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    presentationMode: false,
    cursorMode: CursorMode.Move,
    mediaLibrary: {
      previewWithSound: false,
      sortBy: SORT_BY.NAME
    },
    imageLibrary: {
      sortBy: SORT_BY.NAME
    },
    menuItems: <{ label: string, icon: string, caption: string, path: string }[]>[
      {
        label: 'Dashboard',
        icon: 'dashboard',
        caption: 'Everything in one place',
        path: '/dashboard'
      },
      {
        label: 'Grid Display',
        icon: 'grid_view',
        caption: 'Show the grid',
        path: '/display'
      },
      {
        label: 'Media Library',
        icon: 'video_library',
        caption: 'Manage your media items',
        path: '/library'
      },
      {
        label: 'Playlists',
        icon: 'playlist_play',
        caption: 'Manage your playlists',
        path: '/playlists'
      },
      {
        label: 'Layouts',
        icon: 'dashboard_customize',
        caption: 'Create new and edit existing layouts',
        path: '/layouts'
      },
      {
        label: 'Media Converter',
        icon: 'movie_edit',
        caption: 'Bulk convert video files to mp4',
        path: '/convert'
      },
      {
        label: 'Image Browser',
        icon: 'photo_camera',
        caption: 'Browse images in folders',
        path: '/browse'
      },
      {
        label: 'Settings',
        icon: 'settings',
        caption: 'Set it up',
        path: '/settings'
      }
    ],
    audioSetup: {
      inputDevice: '',
      inputDeviceId: 0
    },
    showFullScreenLoader: true,
    fullScreenLoaderText: 'Performing bootup tasks',
    password: '',
    repeatPassword: '',
    ffmpegPath: '',
    ffprobePath: '',
    panicButton: 'Crtl-X',
    openAIKey: '',
    masterRootFolder: '',
    imageRootFolder: '',
    videoRootFolder: '',
    watchedImageFolders: <IWatchFolder[]>[
      {path: '', alias: 'Hello'}
    ],
    watchedVideoFolders: <IWatchFolder[]>[],
  }),
  getters: {},
  actions: {
    setPresentationMode(_mode: boolean) {
      this.presentationMode = _mode;
    },
    setAudioInputDevice(_device: string) {
      this.audioSetup.inputDevice = _device;
    },
    setLoading(state: boolean, caption?: string) {
      if (caption) this.fullScreenLoaderText = caption;
      this.showFullScreenLoader = state;
    }
  },
});
