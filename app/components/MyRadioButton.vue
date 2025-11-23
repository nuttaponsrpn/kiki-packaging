<template>
  <UFormField
    :label="label"
    :name="name"
    :ui="{
      label: 'font-weight-medium text-size-16 text-gray-700 mb-6',
      container: 'mt-1.5',
    }"
  >
    <URadioGroup
      v-model="model"
      class="custom-radio"
      :orientation="orientation"
      :name="name"
      :items="items"
      :ui="{
        indicator: 'after:bg-primary after:size-2 bg-transparent',
        label: 'font-weight-regular !text-gray-600 text-size-14',
        item: orientation === 'horizontal' ? 'items-center' : 'items-center ml-4 not-last:mb-6',
        legend: 'font-weight-medium text-size-16 text-gray-900 mb-6',
      }"
    />
  </UFormField>
</template>

<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";

withDefaults(
  defineProps<{
    label?: string;
    items?: RadioGroupItem[];
    name?: string;
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    items: () => [],
    label: "",
    name: "",
    orientation: "vertical",
  }
);
const model = defineModel<string | boolean>({ default: "" });
</script>

<style scoped lang="css">
.custom-radio {
  --ui-border-accented: var(--color-gray-500);
  button {
    background: white;
  }
}

.custom-radio :deep([data-state="checked"]) {
  --ui-border-accented: var(--color-primary);
}
</style>
