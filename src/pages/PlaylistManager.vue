<template>
  <q-page>
    <EmptyView v-if="!playListStore.allPlaylists.length"
               message="Playlists are used to group media together and can be loaded into any player."
               heading="You don't have any saved Playlists" icon="playlist_play"
               button-label="Create Playlist" @click="createNewPlaylist"></EmptyView>
    <q-splitter v-model="navWidth" reverse v-else>
      <template v-slot:before>
        <q-splitter v-model="sidebarWidth" class="full-width full-height">
          <template v-slot:before>
            <q-tabs no-caps inline-label v-model="selectedPlaylist" vertical active-color="accent"
                    @update:model-value="setCurrentPlaylist">
              <q-item>
                <q-item-section>
                  <q-item-label>Playlists</q-item-label>
                  <q-item-label caption>Click on a playlist to see its files, or click on New Playlist to create one.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn round icon="playlist_add" color="accent" @click="createNewPlaylist">
                    <q-tooltip anchor="top middle" self="bottom middle">Create Playlist</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-separator></q-separator>
              <q-tab v-for="(playlist, index) in playListStore.allPlaylists" :name="playlist.id">
                <q-item>
                  <q-item-section avatar>
                    <q-icon size="md" name="playlist_play"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-left">{{ playlist.name }}</q-item-label>
                    <q-item-label caption class="text-left">{{ playlist.files.length }} media items</q-item-label>
                  </q-item-section>
                </q-item>
              </q-tab>
            </q-tabs>
            <q-separator></q-separator>
          </template>
          <template v-slot:after>
            <q-tab-panels
              v-model="selectedPlaylist"
              animated
              vertical
              transition-prev="jump-up"
              transition-next="jump-up">
              <q-tab-panel :name="playlist.id" v-for="(playlist, index) in playListStore.allPlaylists"
                           style="padding: 0;">
                <q-toolbar style="background: rgba(30,30,30,1)">
                  <q-toolbar-title>{{ playlist.name }}</q-toolbar-title>
                  <q-input type="text" label="Search files" filled square clearable color="white" v-model="searchText"
                           style="width: 30%">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                  <q-btn label="Delete Playlist" color="secondary" stretch square></q-btn>
                  <q-btn label="Copy Playlist" color="secondary" stretch square></q-btn>
                </q-toolbar>
                <q-scroll-area style="height: 90vh">
                  <draggable
                    v-if="!!playListStore.currentPlaylist.files.length"
                    class="list-group"
                    item-key="id"
                    :component-data="{ tag: 'q-list', name: 'flip-list', type: 'transition' }"
                    v-model="playListStore.currentPlaylist.files"
                    v-bind="dragOptions"
                    @start="isDragging = true"
                    @end="playListStore.saveCurrentPlaylistToDb"
                  >
                    <template #item="{ element }">
                      <q-item dense clickable v-ripple
                              @click="loadVideoIntoPreview(element)">
                        <q-item-section avatar>
                          <q-avatar>
                            <q-icon name="movie" size="sm"></q-icon>
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ element.fileName }}</q-item-label>
                          <q-item-label caption>{{ element.filePath }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toolbar>
                            <div class="q-mr-sm" v-if="element.metadata">{{
                                element.metadata.videoWidth
                              }}x{{ element.metadata.videoHeight }} |

                              {{ convertSecondsToTime(element.metadata.duration) }}
                            </div>

                            <q-btn flat round icon="close" size="sm" color="white" @click.stop="removePlaylistItem">

                            </q-btn>
                          </q-toolbar>

                        </q-item-section>

                      </q-item>
                    </template>
                  </draggable>

                  <div class="absolute-full flex flex-center column" v-else>
                    <PlaylistBuilder media-type="video" @register-files="receiveNewFiles"></PlaylistBuilder>
                  </div>
                </q-scroll-area>

              </q-tab-panel>
            </q-tab-panels>
          </template>
        </q-splitter>
      </template>
      <template v-slot:after v-if="currentLoadedVideo">
        <q-responsive style="overflow: hidden" :ratio="16/9">
          <video-player :autoplay="true"
                        :src="currentLoadedVideo?.filePath + '\\' + currentLoadedVideo?.fileName"
                        :loop="true"
                        :fill="true"
                        controls
          ></video-player>

        </q-responsive>
        <q-card>
          <q-card-section>
            <div class="media-heading text-accent">{{ currentLoadedVideo?.fileName }}</div>
          </q-card-section>
          <q-card-section>
            <q-list dense separator>
              <q-item v-for="(property, index) in metaData">
                <q-item-section>{{ property.key }}</q-item-section>
                <q-item-section side>{{ property.value }}</q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions vertical>
            <q-btn square size="md" label="Refresh Media information" color="secondary"></q-btn>
            <q-btn square size="md" label="Open File Location" color="secondary"></q-btn>
          </q-card-actions>
        </q-card>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import EmptyView from "components/EmptyView.vue";
import {computed, onMounted, ref} from "vue";
import {usePlaylistStore} from "stores/playlist-store";
import {convertSecondsToTime, createUUID, getObjectKeyValues} from "../../shared/Utils";
import {useQuasar} from "quasar";
import {VideoPlayer} from "@videojs-player/vue";
import PlaylistBuilder from "components/PlaylistBuilder.vue";
import draggable from "vuedraggable";

const $q = useQuasar();
const playListStore = usePlaylistStore();
const selectedPlaylist = ref(``);
const currentLoadedVideo = ref();
const searchText = ref('');
const isDragging = ref(false);
const sidebarWidth = ref(30);
const navWidth = ref(20);
const dragOptions = ref({
  animation: 250,
  group: "description",
  disabled: false,
  ghostClass: "ghost"
});

onMounted(async () => {
  await playListStore.retrieveFromDB();
  selectedPlaylist.value = playListStore.allPlaylists[0].id;
  playListStore.setDefaultPlaylist()
});

const filteredFiles = computed(() => {
  const currentPlaylist = playListStore.allPlaylists.filter(playlist => playlist.id === selectedPlaylist.value)[0].files;
  if (searchText.value == null || searchText.value === '') return currentPlaylist;
  return currentPlaylist.filter(file => file.fileName.toLowerCase().includes(searchText.value.toLowerCase()) || file.filePath.toLowerCase().includes(searchText.value.toLowerCase()));
});

function loadVideoIntoPreview(video: IMediaVideo) {
  //window.api.streamVideo(video.filePath + '\\' + video.fileName);
  currentLoadedVideo.value = video;
}

function setCurrentPlaylist(_id: string) {
  currentLoadedVideo.value = undefined;
  playListStore.setCurrentPlaylist(_id)
}

function savePlaylistOnEnd() {

}

// Create a computed function to return metadata as an array
const metaData = computed(() => {
  if (!currentLoadedVideo.value) return {}
  return getObjectKeyValues(currentLoadedVideo.value.metaData)
});

async function createNewPlaylist() {
  $q.dialog({
    title: 'Create a new playlist',
    message: 'Enter a name for the playlist',
    prompt: {
      model: '',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(async (data) => {
    const newPlaylist: IPlaylist = {
      files: [],
      name: data,
      id: createUUID(),
      parentFolder: ''
    }
    await playListStore.saveSinglePlaylistToDb(newPlaylist);
  });
}

async function removePlaylistItem(_item: IMediaVideo) {

}

async function receiveNewFiles(files: IMediaVideo[]) {
  await playListStore.addFilesToPlaylist(selectedPlaylist.value, files);
}
</script>
<style lang="scss">
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 1rem;
  max-width: 100vw;
}

// Overrides
.q-tab {
  justify-content: flex-start !important;
  width: 100%;

  &__content {
    justify-content: flex-start !important;
    width: 100%;
  }

  &--active {
    background-color: $secondary;
  }
}

.ghost {
  opacity: 0;

}
</style>
