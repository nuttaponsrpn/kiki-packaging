<template>
  <div class="flex flex-col gap-2">
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
        :name="name"
        :items="items"
        :ui="{
          indicator: 'after:bg-primary after:size-2 bg-transparent',
          label: 'font-weight-regular !text-gray-600 text-size-16',
          item: 'items-center ml-4 not-last:mb-6',
          legend: 'font-weight-medium text-size-16 text-gray-900 mb-6',
        }"
      />
    </UFormField>

    <ElementMyTextarea
      v-if="model"
      v-model="modelTextarea"
      :label="t('textLabels.pleaseSpecify')"
      :name="name + 'Detail'"
      class="ml-10 mt-2 [&_label]:font-weight-medium [&_label]:text-size-16 [&_label]:text-gray-700"
    />
  </div>
</template>

<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";

withDefaults(defineProps<{ label?: string; items?: RadioGroupItem[]; name?: string }>(), {
  items: () => [],
  label: "",
  name: "",
});
const model = defineModel<string | boolean | undefined>("model");
const modelTextarea = defineModel<string>("model-textarea");

// i18n
const { t } = useI18nDb();

watch(
  () => model.value,
  () => {
    if (!model.value) {
      modelTextarea.value = "";
    }
  }
);
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
