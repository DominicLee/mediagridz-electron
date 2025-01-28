<template>
  <q-card bordered flat class="file-grid-folder flex flex-center" @click="emitFolderSelect">
    <q-icon name="folder" size="64px" color="accent"></q-icon>
  </q-card>
  <div class="file-name full-width">
    <div class="file-name-text">{{ folder.name }}</div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps({
  folder: {}
})

const emit = defineEmits<{
  (e: 'selectFolder', id: string): void
  (e: 'update', value: string): void
}>()

const emitFolderSelect = () => {
  emit('selectFolder', props.folder.name)
}
</script>

<style lang="scss">

</style>
