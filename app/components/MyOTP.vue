<template>
  <UFormField
    v-slot="{ error: fieldError }"
    eager-validation
    class="custom-otp-field aria-invalid:[&_svg]:!block first:w-fit"
    :hint="hint"
    :label="label"
    :name="name"
    :ui="{
      label: ' font-weight-regular text-size-14 text-gray-700',
      container: 'mt-1.5 w-fit',
    }"
  >
    <UPinInput
      v-model:model-value="modelValue"
      otp
      :length="6"
      :type="type"
      :disabled="disabled"
      :ui="{
        root: 'gap-3',
        base:
          ' ring-0 bg-gray-200 focus-visible:ring-1 focus-visible:ring-gray-700 disabled:bg-gray-100 ' +
          'size-12 sm:size-13 text-3xl md:size-16',
      }"
      :class="[{ '[&_input]:ring-1 [&_input]:!ring-status-error': !!fieldError || error }]"
    />
  </UFormField>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
  hint?: string;
  label?: string;
  name?: string;
  type?: "text" | "number";
  error?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  hint: "",
  label: "Code",
  name: "otp",
  type: "number",
  error: false,
});

const modelValue = defineModel<string[]>({
  default: () => [],
});
</script>

<style lang="css">
.custom-otp-field .text-error {
  display: none;
}

.custom-otp-field .text-muted {
  font-size: var(--size-12);
  line-height: 1.34;
  font-weight: var(--weight-regular);
  color: var(--color-gray-600);
}

.custom-otp-field label {
  font-size: var(--size-14);
  line-height: 1.286;
  font-weight: var(--weight-regular);
  color: var(--color-gray-700);
}
</style>
