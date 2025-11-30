<template>
  <div class="max-w-[1200px] mx-auto pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t("orders.createNew") }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400">Select products and quantities to create an order</p>
      </div>
      <UButton
        icon="i-heroicons-x-mark"
        color="neutral"
        variant="ghost"
        size="lg"
        @click="navigateTo('/orders')"
      >
        Cancel
      </UButton>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search products..."
        size="xl"
        :ui="{ base: 'rounded-2xl' }"
      />
    </div>

    <!-- Order Table -->
    <OrderTable
      :products="filteredProducts"
      v-model="quantities"
    />

    <!-- Bottom Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg z-20"
    >
      <div class="max-w-[1200px] mx-auto flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Selected Items</div>
            <div class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedItemsCount }} items</div>
          </div>
          <div class="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <div class="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
            <div class="text-2xl font-black text-primary-600">฿{{ totalAmount.toLocaleString() }}</div>
          </div>
        </div>

        <UButton
          size="xl"
          color="primary"
          class="px-8 font-bold rounded-xl shadow-lg shadow-primary-500/20"
          :disabled="selectedItemsCount === 0"
          @click="showReviewModal = true"
        >
          Review Order
        </UButton>
      </div>
    </div>

    <!-- Review Modal -->
    <OrderReviewModal
      v-model:open="showReviewModal"
      :items="selectedItems"
      :submitting="submitting"
      @confirm="handleCreateOrder"
    />
  </div>
</template>

<script setup lang="ts">
import OrderTable from "~/components/pos/OrderTable.vue";
import OrderReviewModal from "~/components/pos/OrderReviewModal.vue";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { getAllPackaging } = usePackaging();
const { createOrder } = useOrders();

// State
const products = ref<any[]>([]);
const quantities = ref<Record<string, number>>({});
const searchQuery = ref("");
const showReviewModal = ref(false);
const submitting = ref(false);

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const query = searchQuery.value.toLowerCase();
  return products.value.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
  );
});

const selectedItems = computed(() => {
  return Object.entries(quantities.value).map(([id, qty]) => {
    const product = products.value.find((p) => p.id === id);
    return {
      ...product,
      quantity: qty,
    };
  });
});

const selectedItemsCount = computed(() => {
  return Object.values(quantities.value).reduce((sum, qty) => sum + qty, 0);
});

const totalAmount = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
});

// Methods
const loadProducts = async () => {
  const result = await getAllPackaging({ activeOnly: true });
  if (result.success) {
    products.value = result.data.filter((p: any) => p.stock_quantity > 0);
  }
};

const handleCreateOrder = async (details: { notes: string; paymentMethod: "cash" | "transfer" }) => {
  submitting.value = true;

  const orderData = {
    items: selectedItems.value.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.unit_price,
    })),
    paymentMethod: details.paymentMethod,
    notes: details.notes,
  };

  const result = await createOrder(orderData);

  if (result.success) {
    navigateTo("/orders");
  }

  submitting.value = false;
  showReviewModal.value = false;
};

onMounted(() => {
  loadProducts();
});
</script>
