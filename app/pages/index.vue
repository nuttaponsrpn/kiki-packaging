<template>
  <div />
</template>

<script setup lang="ts">
// Redirect root to dashboard
definePageMeta({
  middleware: [
    () => {
      return navigateTo("/dashboard");
    },
  ],
});
</script>
