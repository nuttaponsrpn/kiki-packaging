<template>
  <USwitch
    v-model="model"
    class="custom-switch"
    :ui="{
      thumb: 'm-0.25 data-[state=checked]:translate-x-3.75',
    }"
  />
</template>

<script setup lang="ts">
const model = defineModel<boolean>({
  default: false,
});
</script>

<style lang="css">
.custom-switch {
  --ui-bg-accented: var(--color-gray-500);
}
</style>
