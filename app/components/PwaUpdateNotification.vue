<script setup lang="ts">

import { useRegisterSW } from "virtual:pwa-register/vue";

const { needRefresh, updateServiceWorker } = useRegisterSW();

const toast = useToast();

watch(
  needRefresh,
  (value) => {
    if (value) {
      toast.add({
        title: "Update Available",
        description: "A new version of the application is available.",
        icon: "i-heroicons-arrow-path",
        color: "primary",
        timeout: 0,
        actions: [
          {
            label: "Refresh",
            // @ts-ignore
            click: () => updateServiceWorker(),
          },
          {
            label: "Dismiss",
            // @ts-ignore
            click: () => (needRefresh.value = false),
          },
        ],
      });
    }
  },
  { immediate: true }
);
</script>

<template>
  <div />
</template>
