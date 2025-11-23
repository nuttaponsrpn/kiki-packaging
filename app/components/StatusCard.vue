<template>
  <div class="p-4 rounded-lg border" :class="borderColor">
    <div class="flex items-start gap-3">
      <div class="text-2xl" :class="iconColor">{{ icon }}</div>
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900">{{ title }}</h3>
        <p class="text-size-12 text-gray-600 mt-1">{{ description }}</p>
        <p class="text-size-14 font-bold mt-2" :class="countColor">{{ count }} items</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  count: number;
  icon: string;
  description: string;
}

const props = defineProps<Props>();

const borderColor = "border-green-200 bg-green-50";
const iconColor = "text-green-600";
const countColor = "text-green-700";
</script>
