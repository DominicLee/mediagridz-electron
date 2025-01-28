<template>
  <q-page padding class="flex flex-center">
    <EmptyView message="You can use this utility to export all playlists and media items needed for your current state."
               heading="You don't have any export history" icon="tv" button-label="Select a file"></EmptyView>
  </q-page>
</template>

<script setup lang="ts">

import EmptyView from "components/EmptyView.vue";
</script>
