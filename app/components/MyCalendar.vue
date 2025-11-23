<template>
  <UCalendar
    v-model="modelValue"
    class="p-2"
    prev-month-icon="i-custom-chevron-left"
    next-month-icon="i-custom-chevron-right"
    weekday-format="short"
    :ui="{
      cell: '[&>div]:rounded-lg font-weight-regular text-size-14 [&>div]:data-[selected]:font-medium [&>div]:data-[outside-view]:text-gray-500 cursor-pointer',
    }"
    :year-controls="false"
    :prev-month="{
      variant: 'outline',
      square: true,
      ui: {
        base: '[&_svg]:size-2 rounded-lg [&_path]:fill-gray-600',
      },
    }"
    :next-month="{
      variant: 'outline',
      square: true,
      ui: {
        base: '[&_svg]:size-2 rounded-lg [&_path]:fill-gray-600',
      },
    }"
    @update:model-value="handleDateSelect"
  >
    <template #week-day="{ day }">
      {{ twoLetterDays[day] || day.slice(0, 2) }}
    </template>
    <template #day="{ day }">
      <UChip
        size="2xs"
        position="bottom-right"
        :show="shouldShowChip(day)"
        :ui="{
          base: 'bg-orange-800 left-1/2 -translate-x-1/2 translate-y-1/2 right-auto -bottom-1',
        }"
      >
        {{ day.day }}
      </UChip>
    </template>
  </UCalendar>
</template>

<script setup lang="ts">
import type { DateValue } from "@internationalized/date";

interface Props {
  chipDates?: Date[];
}

const emit = defineEmits<{
  (e: "select", date: DateValue | null): void;
}>();

const modelValue = defineModel<DateValue | null>({
  default: () => null,
});

const props = withDefaults(defineProps<Props>(), {
  chipDates: () => [],
});

const twoLetterDays: Record<string, string> = {
  Sunday: "Su",
  Monday: "Mo",
  Tuesday: "Tu",
  Wednesday: "We",
  Thursday: "Th",
  Friday: "Fr",
  Saturday: "Sa",
  // Also handle short format
  Sun: "Su",
  Mon: "Mo",
  Tue: "Tu",
  Wed: "We",
  Thu: "Th",
  Fri: "Fr",
  Sat: "Sa",
};

const handleDateSelect = (date: unknown) => {
  modelValue.value = date as DateValue | null;
  emit("select", modelValue.value);
};

const shouldShowChip = (day: DateValue) => {
  if (!props.chipDates || props.chipDates.length === 0) return false;

  return props.chipDates.some((date) => {
    return (
      day.year === date.getFullYear() &&
      day.month === date.getMonth() + 1 &&
      day.day === date.getDate()
    );
  });
};
</script>
