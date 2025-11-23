<template>
  <UFormField
    v-slot="{ error }"
    eager-validation
    class="custom-textarea-field aria-invalid:[&_svg]:!block"
    :label="label"
    :name="name"
    :ui="{
      label: 'font-weight-regular text-size-14 text-gray-700',
      container: 'mt-1.5',
    }"
  >
    <div class="relative">
      <UTextarea
        v-model="model"
        autoresize
        :placeholder="placeholder"
        class="w-full"
        :rows="rows"
        :disabled="disabled"
        :ui="{
          base: 'bg-gray-200 ring-0 focus-visible:ring-0 resize-y text-size-16 font-weight-regular p-3 placeholder:text-gray-500 aria-invalid:ring-1 aria-invalid:ring-status-error disabled:bg-gray-100',
        }"
        :class="[
          {
            '[&_textarea]:!font-medium': !!model?.length,
            'disabled:bg-gray-100 disabled:[&_textarea]:text-gray-400': disabled,
          },
        ]"
      />
      <UIcon
        name="i-custom-invalid-icon"
        class="hidden absolute top-3 right-3 text-status-error size-4"
        :class="[{ '!block': !!error }]"
      />
    </div>
  </UFormField>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
  label?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
}

withDefaults(defineProps<Props>(), {
  label: "Label",
  name: "mytextarea",
  disabled: false,
  placeholder: "",
  rows: 4,
});

const model = defineModel<string>();
</script>

<style lang="css">
.custom-textarea-field .text-error {
  display: none;
}
</style>
