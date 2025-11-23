<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-size-32 font-bold text-orange-600">
          {{ t("common.appName") }}
        </h1>
        <p class="text-size-14 text-gray-600 mt-2">
          {{ t("auth.subtitle") }}
        </p>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
