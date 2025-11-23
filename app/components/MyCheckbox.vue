<template>
  <div>
    <UCheckbox
      v-model="model"
      :disabled="disabled"
      :label="label"
      class="[&_svg]:size-3.25"
      default-value="indeterminate"
      :ui="{
        // indicator: 'size-3.25',
        label: 'text-gray-600 font-weight-regular',
        base: 'ring-gray-500 disabled:ring-gray-400 disabled:bg-gray-300',
      }"
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<boolean | "indeterminate">({ default: false });
withDefaults(
  defineProps<{
    disabled?: boolean;
    label?: string;
  }>(),
  {
    disabled: false,
    label: "",
  }
);
</script>

<style scoped lang="css"></style>
