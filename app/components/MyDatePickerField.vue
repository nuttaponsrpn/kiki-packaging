<template>
  <div>
    <UFormField
      :label="label"
      :name="name"
      :ui="{
        label: 'font-weight-regular text-size-14 text-gray-700',
        container: 'mt-1.5',
      }"
    >
      <button
        type="button"
        class="w-full text-left px-4 py-3 rounded-lg text-size-16 flex items-center justify-between transition-colors"
        :name="name"
        :class="['bg-gray-200 text-gray-600 focus:ring-2 focus:ring-blue-500']"
        @click="openModal"
      >
        <span v-if="modelValue" class="font-weight-medium text-gray-900">
          {{ formattedDate }}
        </span>
        <span v-else class="font-weight-regular text-gray-400">
          {{ placeholder }}
        </span>
        <UIcon
          name="i-custom-calendar"
          class="size-5"
          :class="error ? 'text-status-error' : 'text-gray-400'"
        />
      </button>
      <p v-if="error" class="mt-1.5 text-size-14 text-status-error">
        {{ error }}
      </p>
    </UFormField>

    <PersonalInfoDatePickerModal
      v-model="isModalOpen"
      v-model:date="modelValue"
      :title="title"
      :label="label"
      :display-name="displayName"
      :display-surname="displaySurname"
    />
  </div>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, type DateValue } from "@internationalized/date";

interface Props {
  label?: string;
  name?: string;
  placeholder?: string;
  title?: string;
  displayName?: string;
  displaySurname?: string;
  error?: string;
}

withDefaults(defineProps<Props>(), {
  label: "Date of Birth",
  name: "dateOfBirth",
  placeholder: "Select Date",
  title: "ข้อมูลการลงทะเบียน",
  displayName: "",
  displaySurname: "",
  error: "",
});

const modelValue = defineModel<DateValue | null>({
  default: () => null,
});

const isModalOpen = ref(false);

const df = new DateFormatter("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formattedDate = computed(() => {
  if (!modelValue.value) return "";
  return df.format(modelValue.value.toDate(getLocalTimeZone()));
});

const openModal = () => {
  isModalOpen.value = true;
};
</script>

<style scoped>
.custom-calendar-field .text-error {
  display: none;
}
</style>
