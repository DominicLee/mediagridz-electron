<template>
  <q-page class="media-library">
    <q-dialog v-model="dialogVisible">
      <q-card class="bg-secondary">
        <q-card-section class="flex flex-center column">
          <q-spinner-gears size="lg"></q-spinner-gears>
          <div class="q-mt-lg">Parsing file data for {{ totalFiles }} files</div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-toolbar class="q-px-lg bg-secondary">
      <q-input clearable type="text" dense filled square v-model="searchText" placeholder="Search media">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
      <div class="q-px-sm">{{ filteredFiles.length }} / {{ mediaStore.videoMedia.length }}</div>
      <q-space></q-space>
      <q-btn-dropdown :disable="!mediaStore.getSelectedFiles.length"
                      :label="`Selected Files (${mediaStore.getSelectedFiles.length})`" auto-close flat fab square
                      color="white" menu-anchor="bottom end">
        <q-list separator>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Create playlist</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Batch rename</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Move files to...</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="handleConvertFiles">
            <q-item-section>
              <q-item-label>Convert to MP4</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Remove from media library</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label class="text-accent">Delete files</q-item-label>

            </q-item-section>
            <q-item-section side>
              <q-icon name="warning" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-btn-dropdown label="Sort by..." auto-close flat fab square color="white" menu-anchor="bottom end">
        <q-list separator>
          <q-item dense clickable @click="settings.mediaLibrary.sortBy = SORT_BY.NAME">
            <q-item-section>
              <q-item-label>Filename</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.mediaLibrary.sortBy === SORT_BY.NAME">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.mediaLibrary.sortBy = SORT_BY.DATE">
            <q-item-section>
              <q-item-label>Date</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.mediaLibrary.sortBy === SORT_BY.DATE">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.mediaLibrary.sortBy = SORT_BY.FILESIZE">
            <q-item-section>
              <q-item-label>File size</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.mediaLibrary.sortBy === SORT_BY.FILESIZE">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.mediaLibrary.sortBy = SORT_BY.VIDEOSIZE">
            <q-item-section>
              <q-item-label>Video size</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.mediaLibrary.sortBy === SORT_BY.VIDEOSIZE">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.mediaLibrary.sortBy = SORT_BY.DURATION">
            <q-item-section>
              <q-item-label>Duration</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.mediaLibrary.sortBy === SORT_BY.DURATION">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-toggle label="Preview with Sound" v-model="settings.mediaLibrary.previewWithSound" color="accent"></q-toggle>
    </q-toolbar>
    <div class="q-pa-md">
      <EmptyView v-if="!mediaStore.videoMedia.length"
                 message="Here you can see all the media you have imported into MediaGridz"
                 heading="You don't have any media in your library" icon="video_library"
                 button-label="Import Media" @button-click="openFolderBrowser"></EmptyView>
      <div v-else class="media-library-grid">
        <q-card class="full-height full-width flex flex-center outlined-card" flat v-if="!searchText">
          <q-btn label="Import Media" color="white" icon="add" flat @click="openFolderBrowser"></q-btn>
        </q-card>
        <HoverPlayer :media-item="mediaItem" v-for="mediaItem in filteredFiles" :key="mediaItem.id"></HoverPlayer>

      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">

import EmptyView from "components/EmptyView.vue";
import {computed, onMounted, ref} from "vue";
import {VideoPlayer} from "@videojs-player/vue";
import {useMediaStore} from "stores/media-store";
import HoverPlayer from "components/HoverPlayer.vue";
import {COMPATIBLE_VIDEO_FORMATS, RESPONSES, SORT_BY} from "../../shared/Settings";
import {createUUID, dateIsBefore} from "../../shared/Utils";
import {useSettingsStore} from "stores/settings-store";
import {useQuasar} from "quasar";


const componentId = createUUID();
const mediaStore = useMediaStore();
const settings = useSettingsStore();
const dialogVisible = ref(false);
const searchText = ref('');
const totalFiles = ref(0);
const $q = useQuasar();
const filteredFiles = computed(() => {
  let returnedFiles = searchText.value ? mediaStore.videoMedia.filter((mediaItem) => {
    return mediaItem.fileName.toLowerCase().includes(searchText.value.toLowerCase());
  }) : mediaStore.videoMedia;
  switch (settings.mediaLibrary.sortBy) {
    case SORT_BY.NAME:
      returnedFiles = returnedFiles.sort((a, b) => {
        return a.fileName.localeCompare(b.fileName);
      });
      break;
    case SORT_BY.DATE:
      returnedFiles = returnedFiles.sort((a, b) => {
        return dateIsBefore(a.lastModified, b.lastModified);
      });
      break;
    case SORT_BY.FILESIZE:
      returnedFiles = returnedFiles.sort((a, b) => {
        return a.metaData.size - b.metaData.size;
      });
      break;
    case SORT_BY.VIDEOSIZE:
      returnedFiles = returnedFiles.sort((a, b) => {
        return (a.metaData.videoWidth * a.metaData.videoHeight) - (b.metaData.videoWidth * b.metaData.videoHeight)
      });
      break;
    case SORT_BY.DURATION:
      returnedFiles = returnedFiles.sort((a, b) => {
        return a.metaData.duration - b.metaData.duration;
      });
      break;
  }
  return returnedFiles;
});

window.api.receive(componentId, (_message: IMainResponse) => {
  switch (_message.type) {
    case RESPONSES.TOTAL_FILES:
      totalFiles.value = _message.data;
      break;
    case 'progress':
      break;
    case RESPONSES.FILES_SELECTED:
      dialogVisible.value = true;
      break;
  }
});

async function openFolderBrowser() {
  const response = await window.api.openFolderBrowser(componentId, COMPATIBLE_VIDEO_FORMATS);
  dialogVisible.value = false;
  await mediaStore.addMediaToStore(response);
}

async function handleConvertFiles(): void {
  $q.dialog({
    title: 'Convert files to MP4',
    color: 'accent',
    message: `The ${mediaStore.getSelectedFiles.length} selected files will be converted to a more friendly format for MediaGridz. This may take a while. Are you sure you want to continue?`,
    options: {
      type: 'checkbox',
      model: [],
      items: [
        {label: 'Also delete old files and thumbnails', value: 'deleteOldFiles', color: 'accent'},
      ]
    },
    ok: true,
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    console.log('OK', data);
    for (const media of mediaStore.getSelectedFiles) {
      media.isConverting = true;
      media.isSelected = false;
    }
    return true
  }).onCancel(() => {
    console.log('Cancel')
    return false
  })
}

</script>
<style lang="scss">
.media-library {

  &-grid {
    display: grid;
    grid-gap: 24px;
    grid-template-rows: auto;
    grid-template-columns: repeat(8, 1fr);

    .screen--sm & {
      grid-template-columns: repeat(4, 1fr);
    }

    .screen--md & {
      grid-template-columns: repeat(5, 1fr);
    }

    .screen--lg & {
      grid-template-columns: repeat(6, 1fr);
    }
  }

}
</style>
