<template>
  <q-page padding class="flex flex-center">
    <EmptyView message="You can use this utility to convert video to formats MediaGridz can play back."
               heading="You don't have any convert history" icon="movie_edit" button-label="Select a file"></EmptyView>
  </q-page>
</template>

<script setup lang="ts">

import EmptyView from "components/EmptyView.vue";
</script>
