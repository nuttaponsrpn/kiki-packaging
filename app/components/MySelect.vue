<template>
  <UFormField
    class="custom-calendar-field"
    :label="label"
    :name="name"
    :ui="{
      label: 'font-weight-regular text-size-14 text-gray-700',
      root: 'flex [&>div]:last:flex-1',
      container: 'mt-1.5 abcd',
    }"
  >
    <USelect
      v-model="model"
      :disabled="disabled"
      :items="items"
      :value-key="valueKey"
      :ui="{
        base: 'rounded-xl !rounded-br-xl !rounded-tr-xl bg-gray-200 ring-0 focus:ring-1 focus:ring-gray-900 h-full w-full',
        content: 'bg-gray-200',
        item: 'data-highlighted:not-data-disabled:before:bg-gray-300 dark:data-highlighted:not-data-disabled:before:bg-gray-100',
        trailingIcon: 'text-gray-600',
        value: 'text-size-16 font-weight-medium',
      }"
    />
  </UFormField>
</template>

<script setup lang="ts">
import type { GetItemKeys } from "@nuxt/ui/runtime/types/utils.js";

const model = defineModel<undefined | string>();
withDefaults(
  defineProps<{
    disabled?: boolean;
    label?: string;
    name?: string;
    items?: { label: string; value: string }[];
    valueKey?: GetItemKeys<{ label: string; value: string }[]> | undefined;
  }>(),
  {
    disabled: false,
    label: "",
    name: "",
    items: () => [],
    valueKey: "value",
  }
);
</script>
