<template>
  <q-page padding>
    <video-player ref="videoPlayerSWF" :options="videoOptions"></video-player>
  </q-page>
</template>

<script setup lang="ts">
import videojs from "video.js";
import {VideoPlayer} from "@videojs-player/vue";
import "videojs-flash";
import {ref} from "vue";

const videoPlayerSWF = ref();

const videoOptions = ref({
  controls: true,
  autoplay: false,
  preload: "auto",
  fluid: true, // Responsive behavior
  techOrder: ["flash"], // Use Flash tech first
  flash: {
    swf: "https://cdn.jsdelivr.net/npm/videojs-swf/dist/video-js.swf",
  },
  sources: [
    {
      src: "rtmp://localhost/live/video1", // Replace with your RTMP stream URL
      type: "rtmp/mp4", // Specify RTMP stream type
    },
  ]
})
</script>
