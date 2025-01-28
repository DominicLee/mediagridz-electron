<template>
  <div>
    <q-card class="file-grid-file" flat @click="showImage(fileIndex)">
      <q-img ratio="1" :src="filePath" fit="contain"></q-img>
    </q-card>
    <div class="file-name full-width">
      <div class="file-name-text" v-html="decodeURIComponent(fileName)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  filePath: String,
  fileName: String,
  fileIndex: Number,
})

const emit = defineEmits<{
  (e: 'selectImage', path: string): void
}>()

const showImage = () => {
  emit('selectImage', props.fileIndex)
}
</script>

<style lang="scss">

</style>
