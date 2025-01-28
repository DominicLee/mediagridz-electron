<template>
  <q-page>
    <q-toolbar>

    </q-toolbar>
    <component :is="selectedVisualisation"></component>
  </q-page>
</template>

<script setup lang="ts">
import {computed, onMounted, shallowRef} from "vue";
import EpicCarpet from "src/visualisations/epic-carpet/EpicCarpet.vue";
import ShaderToy from "src/visualisations/shadertoy/ShaderToy.vue";
import {useRoute} from "vue-router";

const route = useRoute();

onMounted(() => {

})

const getVisualisation = computed(() => {
  switch (route.params.id) {
    case 'epic-carpet':
      return EpicCarpet;
    case 'shadertoy':
      return ShaderToy;
    default:
      return ShaderToy;
  }
})

const selectedVisualisation = shallowRef(getVisualisation.value);
</script>
