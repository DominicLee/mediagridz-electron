<template>

  <q-card flat class="bg-secondary playlist-card">
    <q-item clickable v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <q-icon name="playlist_play" size="md"></q-icon>
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ playlistName }}</q-item-label>
      </q-item-section>
    </q-item>
    <q-list>
      <q-item dense v-for="playlistFile in playlistFiles" :key="playlistFile.id" clickable v-ripple>
        <q-item-section avatar>
          <q-avatar>
            <q-icon name="movie" size="sm"></q-icon>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ playlistFile }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

  </q-card>

</template>

<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  playlistName: {
    type: Object,
    required: true
  },
  playlistFiles: {
    type: Array,
    required: true
  },
  playlistId: {
    type: String,
    required: true
  }
});
</script>


<style scoped lang="scss">
.playlist-card {
  max-width: 100%;
  overflow: hidden;
}

</style>
