<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoadingProfile"
      class="fixed inset-0 z-9999 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm"
      style="pointer-events: all"
    >
      <div class="flex flex-col items-center space-y-4">
        <!-- Spinner -->
        <div
          class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"
        />
        <!-- Loading text -->
        <p class="text-sm font-medium text-white">{{ t("common.loadingProfile") }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { t } = useI18n();
const isLoadingProfile = useState<boolean>("isLoadingProfile");
</script>
