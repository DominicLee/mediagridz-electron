<template>

  <q-card bordered flat class="file-grid-folder flex flex-center" @click="emitBackSelect">
    <q-icon name="more" size="32px" color="accent"></q-icon>
  </q-card>

</template>

<script setup lang="ts">

const emit = defineEmits<{
  (e: 'emitBackSelect'): void
}>()

const emitBackSelect = () => {
  emit('emitBackSelect')
}
</script>

<style lang="scss">

</style>
