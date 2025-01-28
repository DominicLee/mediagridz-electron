<template>
  <q-page padding class="flex flex-center">
    <EmptyView message="Layouts are used to segment your screen into different areas."
               heading="You don't have any saved Layouts" icon="dashboard_customize"
               button-label="Create Layout"></EmptyView>
  </q-page>
</template>

<script setup lang="ts">

import EmptyView from "components/EmptyView.vue";
import {onMounted} from "vue";
import {useLayoutStore} from "stores/layout-store";

const layoutStore = useLayoutStore();

onMounted(async () => {
  console.log("LayoutManager.vue mounted");
  await layoutStore.saveDefaultLayouts();
});

</script>
