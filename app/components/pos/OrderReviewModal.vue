<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard :ui="{ 
        root: 'divide-y divide-gray-100 dark:divide-gray-800',
      }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ t("orders.reviewOrder") }}</h3>
            <UButton
              color="info"
              variant="ghost"
              icon="i-heroicons-x-mark"
              class="-my-1"
              @click="open = false"
            />
          </div>
        </template>

        <template #default>
          <div class="space-y-6">
            <!-- Items List -->
            <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
              <div
                v-for="item in items"
                :key="item.id"
                class="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <img v-if="item.image_url" :src="item.image_url" class="h-full w-full object-cover" />
                    <UIcon v-else name="i-heroicons-photo" class="h-full w-full p-2 text-gray-400" />
                  </div>
                  <div>
                    <div class="font-medium text-sm text-gray-900 dark:text-white">{{ item.name }}</div>
                    <div v-if="item.description" class="text-xs text-gray-400 line-clamp-1">
                      {{ item.description }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ item.quantity }} x ฿{{ item.unit_price.toLocaleString() }}
                    </div>
                  </div>
                </div>
                <div class="font-bold text-gray-900 dark:text-white">
                  ฿{{ (item.quantity * item.unit_price).toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ t("orders.totalAmount") }}</span>
              <span class="text-2xl font-black text-primary-600">฿{{ total.toLocaleString() }}</span>
            </div>

            <!-- Notes -->
            <UFormField :label="t('orders.notesOptional')" class="w-full">
              <UTextarea v-model="notes" :placeholder="t('orders.notesPlaceholder')" :rows="2" class="w-full" />
            </UFormField>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="info" variant="ghost" @click="open = false"> {{ t("common.cancel") }} </UButton>
            <UButton
              color="primary"
              size="lg"
              :loading="submitting"
              class="px-8 font-bold"
              @click="handleConfirm"
            >
              {{ t("orders.confirmOrder") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open');

const { t } = useI18n();

const props = defineProps<{
  items: any[];
  submitting: boolean;
}>();

const emit = defineEmits(["confirm"]);

const paymentMethod = ref<"cash" | "transfer">("cash");
const notes = ref("");

const total = computed(() => {
  return props.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
});

const handleConfirm = () => {
  emit("confirm", {
    paymentMethod: paymentMethod.value,
    notes: notes.value,
  });
};
</script>
