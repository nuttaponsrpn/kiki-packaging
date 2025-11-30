<template>
  <UFormField
    class="custom-text-field"
    eager-validation
    :label="label"
    :name="name"
    :ui="{
      label: 'font-weight-regular text-size-14 text-gray-700 dark:text-gray-200',
      container: 'mt-1.5 h-fit',
    }"
  >
    <UInput
      v-model="model"
      :inputmode="type === 'number' ? 'numeric' : undefined"
      :leading-icon="leadingIcon"
      :type="type === 'password' ? (showValue ? 'text' : 'password') : 'text'"
      :disabled="disabled"
      :max="999999999"
      :maxlength="maxLength"
      :min="min"
      :placeholder="placeholder"
      :ui="{
        root: 'w-full h-full [&_svg]:size-5 [&_path]:fill-gray-500 [&_svg]:ml-2 [&_input]:h-full',
        base:
          fontWeightClass +
          'hide-number-arrows ring-0 bg-gray-200 dark:bg-gray-700 focus-visible:ring-gray-700 dark:focus-visible:ring-gray-500 focus-visible:ring-1 py-2 px-3 text-size-16 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:ring-0 aria-invalid:ring-status-error aria-invalid:ring-1' +
          (!!leadingIcon ? ' pl-11' : ' '),
      }"
      @input="onlyNumbers"
    >
      <template #trailing>
        <UButton
          v-if="type === 'password'"
          color="neutral"
          variant="link"
          size="sm"
          :icon="showValue ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="showValue ? 'Hide password' : 'Show password'"
          :aria-pressed="showValue"
          aria-controls="password"
          @click="showValue = !showValue"
        />
      </template>
    </UInput>
  </UFormField>
</template>

<script setup lang="ts">
const model = defineModel<string>();
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    label?: string;
    leadingIcon?: string;
    min?: number;
    max?: number;
    maxLength?: number;
    name?: string;
    placeholder?: string;
    show?: boolean;
    type?: "string" | "number" | "password";
  }>(),
  {
    disabled: false,
    label: "",
    leadingIcon: undefined,
    name: "",
    min: undefined,
    max: undefined,
    maxLength: undefined,
    placeholder: "",
    show: true,
    type: "string",
  }
);

const showValue = ref(props.type === "password" ? false : props.show);

const fontWeightClass = computed(() =>
  model.value ? "font-weight-medium" : "font-weight-regular"
);

const onlyNumbers = (event: Event) => {
  if (props.type === "number") {
    const target = event.target as HTMLInputElement;
    target.value = target.value.replace(/[^0-9]/g, "");
  }
};
</script>

<style lang="css">
.custom-text-field .text-error {
  display: none;
}
</style>
