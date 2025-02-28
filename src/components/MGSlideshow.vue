<template>
  <div class="mg-slideshow relative-position" ref="pronSlideshow" @dragover="handleDragOver"
       @drop="handleDrop" :class="isDragging ? 'dragging-over' : ''" @dragleave="isDragging = false"
       @mouseenter="mouseIsOver = true" @mouseleave="mouseIsOver = false">
    <div class="absolute-full flex flex-center column" v-show="!playlist.length">
      <PlaylistBuilder media-type="image" :player-id="playerId" @register-files="receiveNewFiles"></PlaylistBuilder>
    </div>
    <div class="absolute-top quick-bar animated fadeInDown z-top" v-if="showHeaderAndFooter">
      <q-toolbar style="background: rgba(0,0,0,0.3);">
        <q-btn color="accent" v-if="currentImagePath" class="q-mr-sm" size="sm" label="Model" icon="face"></q-btn>
        <q-btn color="accent" v-if="currentImagePath" class="q-mr-sm" size="sm" label="Tags" icon="label"></q-btn>
        <q-btn color="accent" v-if="currentImagePath" class="q-mr-sm" size="sm" label="Rename"
               icon="edit_square"></q-btn>
        <q-space></q-space>
        <q-btn color="accent" class="q-mr-sm" size="sm" label="Load Playlist" icon="folder_open"></q-btn>
        <q-btn color="accent" class="q-mr-sm" size="sm" label="Save Playlist" v-if="currentImagePath"
               @click="handleCreatePlaylist" icon="playlist_play"></q-btn>
      </q-toolbar>
    </div>
    <div class="absolute-bottom quick-footer z-max  animated fadeInUp" v-if="currentImagePath && showHeaderAndFooter">
      <q-toolbar style="background: rgba(0,0,0,0.3);">
        <q-toggle
          dark
          v-model="randomActive"
          color="accent"
          icon="shuffle"
          label="Shuffle"
          class="text-white"
        />
        <q-space></q-space>
        <div class="text-white">{{ currentImagePath.fileName }}</div>
        <q-space></q-space>
        <q-btn :icon="slideshowActive ? 'pause' : 'play_arrow'" color="accent" @click="playPause"></q-btn>
      </q-toolbar>
    </div>
    <q-img v-if="currentImagePath" :src="sanitisedUrl" fit="contain"
           class="image-display no-pointer-events"></q-img>
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {v4 as uuidv4} from "uuid";
import {CUSTOM_PROTOCOL, IRREGULAR_CHARACTERS} from "../../shared/Settings";
import PlaylistBuilder from "components/PlaylistBuilder.vue";
import {useQuasar} from 'quasar'
import CreateNewPlaylist from '../components/CreateNewPlaylist.vue'

enum PLAYMODE {
  RANDOM,
  SEQUENTIAL
}

const isDragging = ref(false);
const currentImagePath = ref();
const totalFiles = ref(0);
const playlist = ref<IMediaImage[]>([]);
const mouseIsOver = ref(false);
const pronSlideshow = ref(null);
const slideshowActive = ref(false);
const waitingForFiles = ref(false);
const dropdownOpen = ref(false);
const $q = useQuasar()
const playMode = computed(() => {
  return randomActive.value ? PLAYMODE.RANDOM : PLAYMODE.SEQUENTIAL;
});
const playerId = uuidv4();
const randomActive = ref(true)
const slideshowInterval = ref(3000);
// Create a regular expression pattern from the keys of the characterMap
const pattern = new RegExp(Object.keys(IRREGULAR_CHARACTERS).map(key => "\\" + key).join("|"), "g");

let windowInterval: number;
let currentPlaylistIndex = 0;

const showHeaderAndFooter = computed(() => {
  if (mouseIsOver.value) return true;
  if (dropdownOpen.value) return true;
  return false;
})

onMounted(() => {
  stopSlideshow();
  window.addEventListener('keyup', (event) => {
    if (event.key === 'PageDown') {
      if (slideshowActive.value) {
        stopSlideshow();
      }
      getNextImage();
    }
    if (event.key === 'PageUp') {
      if (slideshowActive.value) {
        stopSlideshow();
      }
      getPreviousImage();
    }
    if (event.key === ' ') {
      if (slideshowActive.value) {
        stopSlideshow();
      }
      getRandomImage();
    }
  }, true)
});

function handleDropdownClose() {
  console.log("closed dropdown");
  dropdownOpen.value = false
}

function handleCreatePlaylist() {
  $q.dialog({
    component: CreateNewPlaylist,
    componentProps: {
      fileList: playlist.value
    }
  }).onOk(() => {
    console.log('OK')
  }).onCancel(() => {
    console.log('Cancel')
  }).onDismiss(() => {
    console.log('Called on OK or Cancel')
  })
}

function receiveNewFiles(fileList: any[]) {
  waitingForFiles.value = false;
  playlist.value = fileList;
  console.log(fileList);
  getRandomImage();
  startSlideshow();
}

const sanitisedUrl = computed(() => {
  if (!currentImagePath.value) return '';
  return (CUSTOM_PROTOCOL.IMAGE + ':///' + currentImagePath.value.filePath + '\\' + currentImagePath.value.fileName).replace(pattern, (match: string | number) => IRREGULAR_CHARACTERS[match]);
});

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

async function handleDrop(ev: DragEvent) {
  ev.preventDefault();
  isDragging.value = false;
}

function getRandomImage() {
  const randomImage = Math.floor(Math.random() * playlist.value.length);
  currentImagePath.value = playlist.value[randomImage];
  currentPlaylistIndex = randomImage;
  if (currentImagePath.value.fileName.indexOf('.jpg') === -1 || currentImagePath.value.fileName.indexOf('#') > 0) {
    getRandomImage();
  }
}

function getPreviousImage() {
  if (playMode.value === PLAYMODE.SEQUENTIAL) {
    currentPlaylistIndex--
  } else if (playMode.value === PLAYMODE.RANDOM) {
    currentPlaylistIndex = Math.floor(Math.random() * playlist.value.length);
  }
  currentImagePath.value = playlist.value[currentPlaylistIndex];
  /*  if (currentImagePath.value.fileName.indexOf('.jpg') === -1 || currentImagePath.value.fileName.indexOf('#') > 0) {
      getPreviousImage();
    }*/
  return;
}

function getNextImage() {
  if (playMode.value === PLAYMODE.SEQUENTIAL) {
    currentPlaylistIndex++
  } else if (playMode.value === PLAYMODE.RANDOM) {
    currentPlaylistIndex = Math.floor(Math.random() * playlist.value.length);
  }
  currentImagePath.value = playlist.value[currentPlaylistIndex];
  if (currentImagePath.value.fileName.indexOf('.jpg') === -1 || currentImagePath.value.fileName.indexOf('#') > 0) {
    getNextImage();
  }
  return;
}

function playPause() {
  if (slideshowActive.value) {
    stopSlideshow();
    return;
  } else {
    startSlideshow();
    return;
  }
}

function startSlideshow() {
  if (windowInterval) window.clearInterval(windowInterval);
  windowInterval = window.setInterval(() => {
    getRandomImage();
  }, slideshowInterval.value);
  slideshowActive.value = true;
}

function stopSlideshow() {
  if (windowInterval) window.clearInterval(windowInterval);
  slideshowActive.value = false;
}

async function spawnFileBrowser() {
  await window.api.openFileBrowser(playerId);
}

async function spawnFolderBrowser() {
  stopSlideshow();
  waitingForFiles.value = true;
  await window.api.openFolderBrowser(playerId, ['.jpg', '.png', '.jpeg']);
}

function handleDragEnter() {
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}
</script>
<style lang="scss">
.mg-slideshow {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: $dark;
  transition: all 0.3s ease;

  &.dragging-over {

  }
}

.image-display {
  height: 100%;
  width: 100%;
  object-fit: contain;
  z-index: 1;
}
</style>
