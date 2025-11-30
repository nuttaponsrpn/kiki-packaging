<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-2">
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          <tr>
            <th class="px-6 py-4 font-semibold">{{ t("packaging.name") }}</th>
            <th class="px-6 py-4 font-semibold text-right">{{ t("packaging.unitPrice") }}</th>
            <th class="px-6 py-4 font-semibold text-center hidden md:table-cell">{{ t("packaging.stock") }}</th>
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
                  <div v-if="product.description" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
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
            <td class="px-6 py-4 text-center hidden md:table-cell">
              <UBadge
                :color="product.stock_quantity > 10 ? 'neutral' : 'error'"
                variant="subtle"
                size="md"
                class="dark:text-white p-2 rounded-lg"
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
                  class="dark:text-white"
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
                  class="dark:text-white"
                  :disabled="getQuantity(product.id) >= product.stock_quantity"
                  @click="updateQuantity(product.id, getQuantity(product.id) + 1)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <!-- Mobile Card View -->
    <div class="md:hidden space-y-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
        :class="{ 'ring-2 ring-orange-500 dark:ring-orange-400 bg-orange-50 dark:bg-orange-900/10': getQuantity(product.id) > 0 }"
      >
        <div class="flex gap-4">
          <!-- Product Image -->
          <div
            class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
          >
            <img
              v-if="product.image_url"
              :src="product.image_url"
              class="h-full w-full object-cover"
            />
            <UIcon
              v-else
              name="i-heroicons-photo"
              class="h-full w-full p-4 text-gray-400"
            />
          </div>

          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white truncate pr-2">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 text-ellipsis line-clamp-2">{{ product.description }}</p>
              </div>
              <div class="text-right">
                <div class="font-bold text-primary-600 dark:text-primary-400">
                  ฿{{ product.unit_price.toLocaleString() }}
                </div>
                <div class="text-base text-gray-500 dark:text-gray-400">
                  / {{ product.unit }}
                </div>
              </div>
            </div>

            <div class="mt-2 flex items-center gap-2">
              <UBadge
                :color="product.stock_quantity > 10 ? 'neutral' : 'error'"
                variant="subtle"
                size="md"
                class="dark:text-white p-2 rounded-lg"
              >
                Stock: {{ product.stock_quantity }}
              </UBadge>
            </div>
          </div>
        </div>

        <!-- Quantity Control -->
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t("orders.quantity") }}
          </span>
          <div class="flex items-center gap-3">
            <UButton
              icon="i-heroicons-minus"
              size="sm"
              color="neutral"
              variant="soft"
              class="dark:text-white"
              :disabled="getQuantity(product.id) <= 0"
              @click="updateQuantity(product.id, getQuantity(product.id) - 1)"
            />
            <UInput
              type="number"
              :model-value="getQuantity(product.id)"
              :ui="{ base: 'text-center font-bold' }"
              class="w-20 text-center"
              min="0"
              :max="product.stock_quantity"
              @update:model-value="(val) => updateQuantity(product.id, Number(val))"
            />
            <UButton
              icon="i-heroicons-plus"
              size="sm"
              color="neutral"
              variant="soft"
              class="dark:text-white"
              :disabled="getQuantity(product.id) >= product.stock_quantity"
              @click="updateQuantity(product.id, getQuantity(product.id) + 1)"
            />
          </div>
        </div>
      </div>
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
