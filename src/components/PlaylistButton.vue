<template>
  <q-btn color="accent" v-if="currentImagePath" size="sm" label="Image Set" icon="playlist_play">
    <q-menu max-width="400px">
      <q-list separator>
        <q-item clickable dense @click="savePlaylist" v-if="!!localPlaylist.length">
          <q-item-section avatar>
            <q-avatar icon="save"></q-avatar>
          </q-item-section>
          <q-item-section>Create playlist from files</q-item-section>
        </q-item>
        <q-item clickable v-ripple v-for="(mediaItem, index) in localPlaylist" @click="playFromPlaylist(index)"
                v-close-popup>
          <q-item-section style="max-width: 100%; overflow:hidden">
            <q-item-label>{{ mediaItem.fileName }}</q-item-label>
            <q-item-label caption>{{ mediaItem.filePath }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">

</script>

<style lang="scss">

</style>
