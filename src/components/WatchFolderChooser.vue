<template>
  <div class="row justify-between q-gutter-md">
    <q-input outlined dense :model-value="folderAlias" type="text" class="col-grow"></q-input>
    <q-input outlined dense :model-value="folderDefinition" type="text" class="col-grow"></q-input>
    <q-btn round icon="close" color="accent" @click="emits('delete')"></q-btn>
  </div>
</template>

<script setup lang="ts">

import {onBeforeMount, ref} from "vue";

const props = defineProps({
  alias: String,
  definition: String,
})

const emits = defineEmits(['delete'])

const folderAlias = ref();
const folderDefinition = ref(props.definition);

onBeforeMount(() => {
  folderAlias.value = props.alias;
})
</script>

<style lang="scss">

</style>
