<template>
  <q-page>
    <q-dialog v-model="imageViewerVisible" maximized @keydown.right="imageViewIndex++" @keydown.left="imageViewIndex--">
      <q-card bordered class="full-width">
        <q-img fit="contain" :src="currentImageInViewer" height="100%"></q-img>
      </q-card>
    </q-dialog>
    <q-toolbar class="q-px-lg bg-secondary">
      <q-input clearable type="text" dense filled square v-model="searchText" placeholder="Search media">
        <template v-slot:append>
          <q-icon name="search"/>
        </template>
      </q-input>
      <!--      <div class="q-px-sm">{{ filteredFiles.length }} / {{ imageStore.imageMedia.length }}</div>-->
      <q-space></q-space>
      <span>Zoom:</span>
      <q-slider class="images-per-row q-mx-md" :step="1" v-model="imagesPerRow" :min="5" :max="15"></q-slider>
      <span>{{ imagesPerRow }}</span>
      <q-space></q-space>
      <q-btn label="Rename" @click="renameSelected"></q-btn>
      <q-space></q-space>
      <q-btn-dropdown :disable="!imageStore.getSelectedFiles.length"
                      :label="`Selected Files (${imageStore.getSelectedFiles.length})`" auto-close flat fab square
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
          <q-item dense clickable @click="settings.imageLibrary.sortBy = SORT_BY.NAME">
            <q-item-section>
              <q-item-label>Filename</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.imageLibrary.sortBy === SORT_BY.NAME">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.imageLibrary.sortBy = SORT_BY.DATE">
            <q-item-section>
              <q-item-label>Date</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.imageLibrary.sortBy === SORT_BY.DATE">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.imageLibrary.sortBy = SORT_BY.FILESIZE">
            <q-item-section>
              <q-item-label>File size</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.imageLibrary.sortBy === SORT_BY.FILESIZE">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.imageLibrary.sortBy = SORT_BY.VIDEOSIZE">
            <q-item-section>
              <q-item-label>Video size</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.imageLibrary.sortBy === SORT_BY.VIDEOSIZE">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
          <q-item dense clickable @click="settings.imageLibrary.sortBy = SORT_BY.DURATION">
            <q-item-section>
              <q-item-label>Duration</q-item-label>
            </q-item-section>
            <q-item-section side v-if="settings.imageLibrary.sortBy === SORT_BY.DURATION">
              <q-icon name="check" size="xs" color="accent"/>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
    <q-splitter v-model="navWidth" class="full-width full-height">
      <template v-slot:before>
        <q-scroll-area style="height: calc(100vh - 108px); max-width: 100%;">
          <q-list dense>
            <ShortcutLink
              v-for="shortcut in imageStore.shortcuts"
              :key="shortcut.label"
              v-bind="shortcut"
              @shortcut="onShortcut"
            />
          </q-list>
          <q-select
            outlined
            v-if="hardDrives && hardDrives.length > 1"
            v-model="selectedDrive"
            :options="hardDrives"
            option-label="fs"
            option-value="fs"
            label="Drives"
            dense
            class="q-my-md"
            @update:model-value="handleDriveSelect"
          ></q-select>
          <q-tree
            ref="treeRef"
            v-model:selected="selectedKey"
            label-key="name"
            node-key="name"
            :nodes="folderTree"
            dense
            accordion
            default-expand-all
            class="q-ma-md"
            @lazy-load="onLazyLoad"
          />
        </q-scroll-area>
      </template>
      <template v-slot:after>
        <q-scroll-area style="height: calc(100vh - 108px); max-width: 100%;">
          <div class="file-grid" :style="`grid-template-columns: repeat(${20 - imagesPerRow}, minmax(0, 1fr));`">
            <GoBack @emit-back-select="goOneFolderBack" class="file-grid-items"></GoBack>
            <div v-for="(file, index) in filteredFileList" class="file-grid-items">
              <ImageFolder v-if="file.isFolder" :folder="file" @select-folder="handleSelectFolder"></ImageFolder>
              <ImageThumbnail v-else :file-path="file.imgSrc" :file-name="file.name"
                              @select-image="showImage(index)"></ImageThumbnail>
            </div>
          </div>
        </q-scroll-area>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import {CUSTOM_PROTOCOL, MAIN_REQUESTS, SORT_BY} from "../../shared/Settings";
import {useImageStore} from "stores/image-store";
import {useSettingsStore} from "stores/settings-store";
import {computed, onMounted, ref, reactive, unref, isRef, toRaw, isProxy} from "vue";
import {dateIsBefore} from "../../shared/Utils";
import ShortcutLink from "components/ShortcutLink.vue";
import ImageFolder from "components/ImageFolder.vue";
import GoBack from "components/GoBack.vue";
import ImageThumbnail from "components/ImageThumbnail.vue";
import {useQuasar} from "quasar";
import {extractMetadataFromFiles} from "../services/ModelController";

const imageStore = useImageStore();
const settings = useSettingsStore();
const searchText = ref('');
const treeRef = ref();
const imagesPerRow = ref(8);
const imageViewIndex = ref(0);
const hardDrives = ref();
const selectedDrive = ref();
const selectedImage = ref(0);
const imageViewerVisible = ref(false);
const selectedKey = ref();
const folderNodes = ref([] as any[] as any[]);
const currentFolderContents = ref([] as any[]);
const navWidth = ref(20);
const folderTree = ref([]);
const $q = useQuasar();

const filteredFiles = computed(() => {
  let returnedFiles = searchText.value ? imageStore.imageMedia.filter((mediaItem) => {
    return mediaItem.fileName.toLowerCase().includes(searchText.value.toLowerCase());
  }) : imageStore.imageMedia;
  switch (settings.imageLibrary.sortBy) {
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
  }
  return returnedFiles;
});

onMounted(async () => {
  hardDrives.value = await window.api[MAIN_REQUESTS.GET_WINDOWS_DRIVES]();
})

const renameSelected = async () => {
  let modelNames: string[] = [currentFolderPath.value];
  modelNames.push(...currentFolderContents.value.map((file: any) => {
    return file.name
  }));
  const suggestedModelMetadata = await extractMetadataFromFiles(modelNames);
  console.log(suggestedModelMetadata);
  let itemList: any[] = [];
  if (suggestedModelMetadata.modelname) itemList.push({
    label: `Model: ${suggestedModelMetadata.modelname}`, value: {
      modelName:
      suggestedModelMetadata
        .modelname
    }
  });
  if (suggestedModelMetadata.photographer && suggestedModelMetadata.photographer !== 'null') itemList.push({
    label: `Photographer: ${suggestedModelMetadata.photographer}`, value: {
      photographer:
      suggestedModelMetadata
        .photographer
    }
  });
  if (suggestedModelMetadata.publication && suggestedModelMetadata.publication !== 'null') itemList.push({
    label: `Publication: ${suggestedModelMetadata.publication}`, value: {
      publication:
      suggestedModelMetadata
        .publication
    }
  });
  if (suggestedModelMetadata.year && suggestedModelMetadata.year !== 'null') itemList.push({
    label: `Year: ${suggestedModelMetadata.year}`, value: {
      year:
      suggestedModelMetadata
        .year
    }
  });
  $q.dialog({
    title: 'Scraped metadata',
    message: `Confirm the following metadata`,
    options: {
      model: [],
      type: 'checkbox',
      items: itemList
    },
    cancel: true,
    persistent: true
  }).onOk(async (selectedMetaData) => {
    const filesToConvert: string[] = filteredFileList.value.map((file: any) => {
      return file.imgSrc
    })
    const flattened = flattenObjectWithRefs(selectedMetaData);
    console.log(flattened);
    await window.api.renameFile('', filesToConvert, flattened, [], "-");
  }).onCancel(() => {
    // console.log('>>>> Cancel')
  }).onDismiss(() => {
    // console.log('I am triggered on both OK and Cancel')
  })

}

const currentFolderPath = computed(() => {
  return folderNodes.value.join('/')
})

const currentImageInViewer = computed(() => {
  return currentFolderContents.value[imageViewIndex.value].imgSrc
})

const filteredFileList = computed(() => {
  if (!searchText.value) return currentFolderContents.value
  return currentFolderContents.value.filter((file) => {
    return file.name.toLowerCase().includes(searchText.value.toLowerCase());
  })
})

function flattenObjectWithRefs(obj: any[]) {
  const flattenedObject = {};

  obj.forEach(pair => {
    // Assume each pair is an object with a single key-value pair
    const [key, value] = Object.entries(pair)[0];
    flattenedObject[key] = value;
  });

  return flattenedObject;
}

const handleSelectFolder = async (folder: any) => {
  folderNodes.value.push(folder);
  currentFolderContents.value = await fetchFileContents();
}

const fetchFolderContents = async () => {
  const fetchFolders = await window.api.getFilesAndFoldersForPath(currentFolderPath.value)
  return fetchFolders.filter((entry: any) => entry.isDirectory).map((entry: any) => {
    return {name: entry.name, path: entry.path, lazy: true, level: folderNodes.value.length};
  })
}

const fetchFileContents = async () => {
  const fetchFolders = await window.api.getFilesAndFoldersForPath(currentFolderPath.value)
  return fetchFolders.filter((entry: any) => {
    return entry.isDirectory || entry.name.includes('jpg') || entry.name.includes('png')
  }).map((entry: any) => {
    return {
      name: entry.name,
      path: entry.path,
      isFolder: entry.isDirectory,
      imgSrc: CUSTOM_PROTOCOL.IMAGE + ':///' + currentFolderPath.value.replace('#', '%23') + '/' + entry.name
    };
  })
}

const goOneFolderBack = async () => {
  folderNodes.value.pop();
  currentFolderContents.value = await fetchFileContents();
}

const showImage = (imageIndex: number) => {
  imageViewIndex.value = imageIndex;
  imageViewerVisible.value = true;
}

const onLazyLoad = async ({node, key, done, fail}) => {
  const start: number = node.level;
  const end: number = folderNodes.value.length - (node.level - 1);
  folderNodes.value.splice(start, end)
  folderNodes.value.push(node.name);
  const nodeChildren = await fetchFolderContents();
  currentFolderContents.value = await fetchFileContents();
  done(nodeChildren.map((entry: any) => {
    return {name: entry.name, lazy: true, level: folderNodes.value.length};
  }));
}

const handleDriveSelect = async (driveSelected: any) => {
  const driveMap = driveSelected.fs;
  folderNodes.value = [driveMap];
  folderTree.value = await fetchFolderContents()
}
</script>

<style lang="scss">
.file-grid {
  padding: 10px;
  display: grid;
  grid-template-rows: auto;
  grid-gap: 10px;

  &-folder {
    aspect-ratio: 1;
    max-width: 10w;
    overflow: hidden;
  }

  &-file {
    aspect-ratio: 1;
    outline: 1px solid $accent;
  }
}

.file-name {
  height: 3rem;
  font-size: 0.85rem;
  overflow: hidden;
  padding-top: 8px;
  line-height: 1;


  &-text {
    display: -webkit-box;
    max-width: 400px;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.images-per-row {
  width: 200px;
}
</style>
