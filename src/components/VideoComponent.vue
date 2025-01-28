<template>
  <video
    :id="playerId"
    ref="videoPlayerElement"
    width="100%"
    height="100%"
    autoplay
    controls
  >
    <source :src="videoSource" type="video/mp4"/>
  </video>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  sourceFile: String,
  playerId: String,
  volumeLevel: Number
})

const emits = defineEmits(['ended', 'error']);

const videoPlayerElement = ref();
const videoSource = ref();

let Player: any;

onMounted(() => {
  videoPlayerElement.value.addEventListener('ended', () => emits('ended'))
  videoPlayerElement.value.src = props.sourceFile;
})

watch(() => props.volumeLevel, (newValue, oldValue) => {
  videoPlayerElement.value.volume = newValue;
})

watch(() => props.sourceFile, (newValue, oldValue) => {
  videoPlayerElement.value.src = newValue;
})
</script>

<style lang="scss">

</style>
