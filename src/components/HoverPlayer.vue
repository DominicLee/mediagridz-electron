<template>
  <q-card class="full-height full-width outlined-card bg-secondary cursor-pointer relative-position"
          :class="{selected: mediaItem.isSelected}" flat @mouseenter="handleHoverStart" @mouseleave="handleHoverEnd"
          @click="selectMediaItem" v-intersection="initialise">
    <!--    <q-tooltip class="bg-accent" anchor="top middle" self="bottom middle" :delay="800">
          {{ mediaItem.fileName }}
        </q-tooltip>-->
    <q-checkbox v-model="mediaItem.isSelected" color="accent" class="absolute-top-left"
                style="z-index: 99"></q-checkbox>
    <q-icon v-if="mediaItem.metaData.videoCodec !== 'h264'" name="warning" size="sm" class="absolute-top-right q-pa-sm"
            color="accent" style="z-index: 99">
      <q-tooltip class="bg-accent" anchor="bottom middle" self="top middle" :delay="800">
        This video is not encoded in h264 and may not play correctly
      </q-tooltip>
    </q-icon>
    <video-player :autoplay="true"
                  :src="mediaItem.filePath+'\\'+mediaItem.fileName"
                  :loop="true"
                  :fill="true"
                  aspect-ratio="16:9"
                  :muted="!settings.mediaLibrary.previewWithSound"
                  v-if="isInitialised && isHovering"
    >
    </video-player>
    <q-img no-spinner :src="thumbnailPath" loading="lazy" v-else :ratio="16/9" :contain="true" v-if="isInitialised">
      <template v-slot:error>
        <div class="absolute-full flex flex-center column">
          <q-circular-progress indeterminate></q-circular-progress>
          <div class="text-accent">Creating thumbnail</div>
        </div>
      </template>
      <div class="absolute-bottom file-name" style="padding: 8px;">
        {{ sanitisedName }}
      </div>
    </q-img>
    <q-responsive :ratio="16/9" v-if="!isInitialised"></q-responsive>
    <div class="media-info relative-position flex justify-between">
      <div class="q-pa-sm" style="max-width:80%">

        <div>
          <q-icon color="accent" size="xs" name="movie" class="q-pr-xs"></q-icon>
          {{ mediaItem.metaData.videoWidth }} x {{ mediaItem.metaData.videoHeight }} |
          {{ mediaItem.metaData.videoCodec }}
        </div>
        <div>
          <q-icon color="accent" size="xs" name="graphic_eq" class="q-pr-xs"></q-icon>
          {{ Math.floor(mediaItem.metaData.audioBitRate / 1000) }} kbps | {{ mediaItem.metaData.audioCodec }}
        </div>
        <div>
          <q-icon color="accent" size="xs" name="av_timer" class="q-pr-xs"></q-icon>
          {{ videoLength }}
        </div>
      </div>

      <q-btn-dropdown flat fab square color="accent" dropdown-icon="more_vert" menu-anchor="bottom end"
                      @click.stop="(e) => e.preventDefault()">
        <q-list separator class="bg-accent">
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Add to playlist</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Add Tags</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="keyboard_arrow_right"/>
            </q-item-section>
            <q-menu anchor="top end" self="top start" class="bg-accent" style="width: 275px">
              <q-select
                color="white"
                v-model="mediaItem.tags"
                :options="mediaStore.mediaTags"
                use-chips
                dense filled square
                multiple
                options-dense
                label-color="white"
                options-dark
                label="Select tags"
                @update:model-value="mediaStore.updateMediaInStore(mediaItem)"
              />
            </q-menu>
          </q-item>
          <q-item dense clickable @click="triggerConvert">
            <q-item-section>
              <q-item-label>Convert file to MP4</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable>
            <q-item-section>
              <q-item-label>Rename media</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="deleteMedia">
            <q-item-section>
              <q-item-label>Remove from library</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    <q-inner-loading :showing="mediaItem.isConverting" class="q-pa-lg">
      <q-spinner-gears size="50px" color="accent" class="q-mb-lg"/>
      <q-linear-progress stripe size="10px" color="accent" :value="progress/100" class="q-mb-lg"></q-linear-progress>
    </q-inner-loading>
  </q-card>
</template>
<script setup lang="ts">
import {VideoPlayer} from "@videojs-player/vue";
import {computed, onMounted, PropType, ref, toRaw, watch} from "vue";
import {convertSecondsToTime} from "../../shared/Utils";
import {useSettingsStore} from "stores/settings-store";
import {RESPONSES} from "../../shared/Settings";
import {useMediaStore} from "stores/media-store";
import {useQuasar} from "quasar";

const $q = useQuasar();
const props = defineProps({
  mediaItem: {
    type: Object as PropType<IMediaVideo>,
    required: true
  }
});

watch(() => props.mediaItem.isConverting, async (newValue, oldValue) => {
  if (newValue) {
    console.log(`Triggering convert for ${props.mediaItem.id}`);
    await window.api.convertFile(toRaw(props.mediaItem), true);
  }
});

let hoverDelay: number;
let appPath = ref('');

const isHovering = ref(false);
const isInitialised = ref(false);
const progress = ref(0);
const settings = useSettingsStore();
const mediaStore = useMediaStore();

const thumbnailPath = computed(() => {
  if (!appPath.value) {
    return '';
  }
  return appPath.value + '\\thumbnails\\' + props.mediaItem.id + '\\' + props.mediaItem.id + '.jpg';
});

const videoLength = computed(() => {
  if (!props.mediaItem.metaData) {
    return '';
  }
  return convertSecondsToTime(props.mediaItem.metaData.duration);
});

const sanitisedName = computed(() => {
  return props.mediaItem.fileName.replace(/[^a-zA-Z0-9\s\-.]/g, " ");
});

window.api.receive(props.mediaItem.id, (_message: IMainResponse) => {
  switch (_message.type) {
    case RESPONSES.PROGRESS:
      progress.value = _message.data.progress
      break;
    case RESPONSES.FILES_CONVERTED:
      mediaStore.updateMediaInStore(_message.data);
      break;
  }
});

onMounted(async () => {
  appPath.value = await window.api.getAppPath();
});

async function selectMediaItem() {
  window.clearTimeout(hoverDelay);
  props.mediaItem.isSelected = !props.mediaItem.isSelected;
}

async function triggerConvert() {
  $q.dialog({
    title: 'Convert files to MP4',
    color: 'accent',
    message: `This file will be converted to a more friendly format for MediaGridz. This may take a while. Are you sure you want to continue?`,
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
  }).onOk(async (data) => {
    console.log('OK', data);
    props.mediaItem.isConverting = true;
    return true
  }).onCancel(() => {
    console.log('Cancel')
    return false
  })

}

async function deleteMedia() {
  $q.dialog({
    title: 'Remove file from library',
    color: 'accent',
    message: `File ${props.mediaItem.fileName} will be removed from the library. Are you sure you want to continue?`,
    options: {
      type: 'checkbox',
      model: [],
      items: [
        {label: 'Also delete files and thumbnails', value: 'deleteFiles', color: 'accent'},
      ]
    },
    ok: true,
    cancel: true,
    persistent: true,
  }).onOk(async (data) => {
    console.log('OK', data);
    if (data.includes('deleteFiles')) {
      await window.api.deleteFile(toRaw(props.mediaItem as IMediaVideo));
    }
    await mediaStore.removeMediaFromStore(props.mediaItem);
    return true
  }).onCancel(() => {
    console.log('Cancel')
    return false
  })

  //await window.api.convertFile(toRaw(props.mediaItem), true);
}

function initialise(item: any, observer: any) {
  if (item.isIntersecting) {
    isInitialised.value = true;
    observer.unobserve(item.target);
  }
}

function handleHoverStart(e: MouseEvent): void {
  hoverDelay = window.setTimeout(() => {
    isHovering.value = true;
  }, 1000)
}

function handleHoverEnd(e: MouseEvent): void {
  window.clearTimeout(hoverDelay);
  isHovering.value = false;
}

</script>

<style scoped lang="scss">
.media-info {
  font-size: 0.7rem;
}

.file-name {
  font-size: 0.75rem;
  line-height: 1.1;
}

</style>
