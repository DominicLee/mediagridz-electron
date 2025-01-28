<template>
  <q-page class="relative-position">
    <!--    <div class="absolute-top-left z-max">
          <q-btn round color="secondary" icon="save" class="q-mx-xs" @click="saveState"></q-btn>
        </div>-->
    <div class="video-grid absolute-full" :class="`layout-${currentLayout}`"
         :style="`grid-template-columns: ${currentLayoutDefinition.gridColumns}; grid-template-rows: ${currentLayoutDefinition.gridRows}; grid-template-areas: ${currentLayoutDefinition.gridAreas}`">
      <template v-for="(value, index) in videoCount" :key="index+1">
        <MGVideoPlayer :initial-area="`video${index+1}`" ref="videoReferences"></MGVideoPlayer>
      </template>
      <div class="pr0n-video-wrapper" v-for="(value, index2) in slideshowCount" :data-area="`slideshow${index2+1}`"
           :style="`grid-area: slideshow${index2+1}`">
        <MGSlideshow :key="index2+1"></MGSlideshow>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import {computed, ref, toRaw} from 'vue';

import {useLayoutStore} from "stores/layout-store";
import {useQuasar} from "quasar";
import MGVideoPlayer from "../components/MGVideoPlayer.vue";
import MGSlideshow from "../components/MGSlideshow.vue";

const layoutStore = useLayoutStore();
const $q = useQuasar();
const currentLayout = ref(2);
const videoReferences = ref([]);

const currentLayoutDefinition = computed(() => {
  return layoutStore.getCurrentLayout;
});

const videoCount = computed(() => {
  return layoutStore.getCurrentLayout.videoCount;
});

const slideshowCount = computed(() => {
  return layoutStore.getCurrentLayout.slideshowCount;
});

async function saveState(): Promise<boolean> {
  let saveFile: ISaveFile = {
    layout: toRaw(currentLayoutDefinition.value),
    videoPlayers: videoReferences.value.map((video: any) => {
      return video.getState();
    }),
  };
  console.log(saveFile);
  const savedFilePath: string = await window.api.saveConfig(saveFile);
  if (savedFilePath) {
    $q.dialog({
      title: 'Save successful',
      message: `Saved to ${savedFilePath}`,
      ok: true,
      cancel: false,
    }).onOk(() => {
      console.log('OK');
      return true
    }).onCancel(() => {
      console.log('Cancel')
      return false
    })
  }
  return false;
}

</script>
<style lang="scss">
.video-grid {
  display: grid;
  width: 100%;
  height: 100%;

  background-color: #000;
  overflow: hidden;
  grid-gap: 10px;


}
</style>
