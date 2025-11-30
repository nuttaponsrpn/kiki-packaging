<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400">
          <tr>
            <th class="px-6 py-4 font-semibold">{{ t("packaging.name") }}</th>
            <th class="px-6 py-4 font-semibold text-right">{{ t("packaging.unitPrice") }}</th>
            <th class="px-6 py-4 font-semibold text-center">{{ t("packaging.stock") }}</th>
            <th class="px-6 py-4 font-semibold text-center w-48">{{ t("orders.quantity") }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="product in products"
            :key="product.id"
            class="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            :class="{ 'bg-orange-50/50 dark:bg-orange-900/10': getQuantity(product.id) > 0 }"
          >
            <!-- Product Info -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <div
                  class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                >
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    class="h-full w-full object-cover"
                  />
                  <UIcon
                    v-else
                    name="i-heroicons-photo"
                    class="h-full w-full p-3 text-gray-400"
                  />
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ product.name }}
                  </div>
                  <div class="text-xs text-gray-500">{{ product.sku }}</div>
                  <div v-if="product.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {{ product.description }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Price -->
            <td class="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
              ฿{{ product.unit_price.toLocaleString() }}
            </td>

            <!-- Stock -->
            <td class="px-6 py-4 text-center">
              <UBadge
                :color="product.stock_quantity > 10 ? 'neutral' : 'error'"
                variant="subtle"
                size="xs"
              >
                {{ product.stock_quantity }} {{ product.unit }}
              </UBadge>
            </td>

            <!-- Quantity Input -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <UButton
                  icon="i-heroicons-minus"
                  size="xs"
                  color="neutral"
                  variant="soft"
                  :disabled="getQuantity(product.id) <= 0"
                  @click="updateQuantity(product.id, getQuantity(product.id) - 1)"
                />
                <UInput
                  type="number"
                  :model-value="getQuantity(product.id)"
                  class="w-16 text-center"
                  :ui="{ base: 'text-center' }"
                  min="0"
                  :max="product.stock_quantity"
                  @update:model-value="(val) => updateQuantity(product.id, Number(val))"
                />
                <UButton
                  icon="i-heroicons-plus"
                  size="xs"
                  color="neutral"
                  variant="soft"
                  :disabled="getQuantity(product.id) >= product.stock_quantity"
                  @click="updateQuantity(product.id, getQuantity(product.id) + 1)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="products.length === 0" class="p-12 text-center">
      <UIcon name="i-heroicons-inbox" class="text-4xl text-gray-300 mb-2" />
      <p class="text-gray-500">{{ t("common.noResults") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  products: any[];
  modelValue: Record<string, number>; // Map of productId -> quantity
}>();

const emit = defineEmits(["update:modelValue"]);

const getQuantity = (productId: string) => {
  return props.modelValue[productId] || 0;
};

const updateQuantity = (productId: string, quantity: number) => {
  const product = props.products.find((p) => p.id === productId);
  if (!product) return;

  // Clamp quantity between 0 and stock
  const newQuantity = Math.max(0, Math.min(quantity, product.stock_quantity));

  const newModelValue = { ...props.modelValue };
  if (newQuantity > 0) {
    newModelValue[productId] = newQuantity;
  } else {
    delete newModelValue[productId];
  }

  emit("update:modelValue", newModelValue);
};
</script>
