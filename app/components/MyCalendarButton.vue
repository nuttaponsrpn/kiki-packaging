<template>
  <div class="@container">
    <UPopover v-model:open="isOpen">
      <UFormField
        v-slot="{ error }"
        class="custom-calendar-field"
        :label="label"
        :name="name"
        :ui="{
          label: 'font-weight-regular text-size-14 text-gray-700',
          container: 'mt-1.5',
        }"
      >
        <UButton
          color="neutral"
          variant="subtle"
          :disabled="disabled"
          trailing-icon="i-custom-calendar"
          class="w-full text-size-16 text-gray-600 focus:text-gray-900 rounded-lg bg-gray-200 ring-0 @max-[120px]:w-fit @max-[120px]:min-w-fit min-w-30 justify-between"
          :class="[
            {
              'disabled:bg-gray-100 disabled:[&_path]:fill-gray-400': disabled,
              'ring-1 ring-status-error': error,
            },
          ]"
        >
          <span v-if="modelValue" class="font-weight-medium @max-[120px]:hidden">
            {{ df.format(modelValue.toDate(getLocalTimeZone())) }}
          </span>
          <span v-else class="font-weight-regular @max-[120px]:hidden"> {{ placeholder }} </span>
        </UButton>
      </UFormField>

      <template #content>
        <ElementMyCalendar
          v-model="modelValue"
          :chip-dates="props.chipDates"
          @select="isOpen = false"
        />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, type DateValue } from "@internationalized/date";

interface Props {
  chipDates?: Date[];
  disabled?: boolean;
  label?: string;
  name?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  chipDates: () => [],
  disabled: false,
  label: "Label",
  name: "mycalendar",
  placeholder: "Select Date",
});

const modelValue = defineModel<DateValue | null>({
  default: () => null,
});
const isOpen = ref(false);

const df = new DateFormatter("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
</script>

<style lang="css">
.custom-calendar-field .text-error {
  display: none;
}
</style>
