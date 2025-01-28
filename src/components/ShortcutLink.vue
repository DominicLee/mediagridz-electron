<template>
  <q-item
    clickable
    @click="onClick"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ name }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts" setup>

const props = defineProps({
  icon: String,
  name: String,
  label: String,
  path: String,
})
</script>
