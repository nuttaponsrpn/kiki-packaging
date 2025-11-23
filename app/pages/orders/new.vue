<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <UButton
          icon="i-heroicons-arrow-left"
          size="sm"
          color="gray"
          variant="ghost"
          @click="navigateTo('/orders')"
        >
          Back
        </UButton>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t("orders.createNew") }}
      </h1>
    </div>

    <!-- Loading Products -->
    <div v-if="loadingProducts" class="flex justify-center items-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-orange-600" />
      <span class="ml-3">{{ t("common.loading") }}</span>
    </div>

    <!-- No Products Available -->
    <UCard v-else-if="productOptions.length === 0">
      <div class="text-center py-8">
        <UIcon name="i-heroicons-inbox" class="text-6xl text-gray-400 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ t("orders.noProductsAvailable") }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          There are no packaging products available with stock. Please add products first or check stock levels.
        </p>
        <div class="flex justify-center gap-3">
          <UButton
            v-if="userProfile?.role === 'admin'"
            icon="i-heroicons-plus"
            @click="navigateTo('/packaging')"
          >
            Add Packaging Products
          </UButton>
          <UButton
            color="gray"
            variant="ghost"
            @click="navigateTo('/orders')"
          >
            Back to Orders
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Form -->
    <UCard v-else>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Product Selection -->
        <UFormGroup :label="t('orders.product')" required>
          <USelectMenu
            v-model="selectedProduct"
            :options="productOptions"
            :placeholder="t('orders.selectProduct')"
            value-attribute="value"
            option-attribute="label"
            searchable
            required
          />
          <template #help>
            <div v-if="selectedProduct" class="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Available stock:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ getProductStock(selectedProduct) }} {{ getProductUnit(selectedProduct) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm mt-1">
                <span class="text-gray-600 dark:text-gray-400">Price per unit:</span>
                <span class="font-semibold text-gray-900 dark:text-white">
                  ฿{{ getProductPrice(selectedProduct).toFixed(2) }}
                </span>
              </div>
            </div>
          </template>
        </UFormGroup>

        <!-- Quantity -->
        <UFormGroup :label="t('orders.quantity')" required>
          <UInput
            v-model.number="formData.quantity"
            type="number"
            :placeholder="t('orders.quantity')"
            :min="1"
            :max="getProductStock(selectedProduct)"
            required
          />
          <template #help>
            <div v-if="selectedProduct && formData.quantity > getProductStock(selectedProduct)" class="mt-2 text-sm text-red-600">
              {{ t("orders.insufficientStock") }} - {{ t("packaging.stock") }}: {{ getProductStock(selectedProduct) }}
            </div>
            <div v-else-if="formData.quantity && selectedProduct" class="mt-2 text-sm">
              <span class="text-gray-600 dark:text-gray-400">{{ t("orders.total") }}: </span>
              <span class="font-semibold text-gray-900 dark:text-white">
                ฿{{ calculateTotal().toFixed(2) }}
              </span>
            </div>
          </template>
        </UFormGroup>

        <!-- Notes -->
        <UFormGroup :label="t('orders.notes')">
          <UTextarea
            v-model="formData.notes"
            :placeholder="t('orders.notes')"
            :rows="4"
          />
        </UFormGroup>

        <!-- Summary -->
        <div v-if="selectedProduct && formData.quantity" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Product:</span>
              <span class="text-gray-900 dark:text-white">{{ getProductName(selectedProduct) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Quantity:</span>
              <span class="text-gray-900 dark:text-white">
                {{ formData.quantity }} {{ getProductUnit(selectedProduct) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Price per unit:</span>
              <span class="text-gray-900 dark:text-white">฿{{ getProductPrice(selectedProduct).toFixed(2) }}</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div class="flex justify-between font-semibold text-base">
                <span class="text-gray-900 dark:text-white">Total:</span>
                <span class="text-orange-600">฿{{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <UButton
            type="button"
            color="gray"
            variant="ghost"
            @click="navigateTo('/orders')"
          >
            {{ t("common.cancel") }}
          </UButton>
          <UButton
            type="submit"
            :loading="submitting"
            :disabled="!selectedProduct || !formData.quantity || formData.quantity > getProductStock(selectedProduct)"
          >
            {{ t("common.create") }}
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { getAllPackaging } = usePackaging();
const { createOrder } = useOrders();

// State
const loadingProducts = ref(true);
const products = ref<any[]>([]);
const selectedProduct = ref<string | null>(null);
const submitting = ref(false);

const formData = ref({
  quantity: 1,
  notes: "",
});

// Computed
const productOptions = computed(() => {
  return products.value
    .filter((p) => p.is_active && p.stock_quantity > 0)
    .map((p) => ({
      label: `${p.name} (${p.sku}) - Stock: ${p.stock_quantity} ${p.unit}`,
      value: p.id,
    }));
});

// Methods
const loadProducts = async () => {
  loadingProducts.value = true;
  const result = await getAllPackaging({ activeOnly: true });
  if (result.success) {
    console.log("All active packaging products:", result.data);
    console.log("Total active products:", result.data.length);
    products.value = result.data.filter((p: any) => p.stock_quantity > 0);
    console.log("Products with stock > 0:", products.value.length);

    if (result.data.length === 0) {
      console.warn("No active packaging products found in database");
    } else if (products.value.length === 0) {
      console.warn("Active products exist but all have 0 stock");
    }
  } else {
    console.error("Error loading packaging products:", result.error);
  }
  loadingProducts.value = false;
};

const getProduct = (productId: string | null) => {
  if (!productId) return null;
  return products.value.find((p) => p.id === productId);
};

const getProductName = (productId: string | null) => {
  const product = getProduct(productId);
  return product?.name || "";
};

const getProductStock = (productId: string | null) => {
  const product = getProduct(productId);
  return product?.stock_quantity || 0;
};

const getProductUnit = (productId: string | null) => {
  const product = getProduct(productId);
  return product?.unit || "";
};

const getProductPrice = (productId: string | null) => {
  const product = getProduct(productId);
  return product?.unit_price || 0;
};

const calculateTotal = () => {
  if (!selectedProduct.value || !formData.value.quantity) return 0;
  const price = getProductPrice(selectedProduct.value);
  return price * formData.value.quantity;
};

const handleSubmit = async () => {
  if (!selectedProduct.value) return;

  submitting.value = true;

  const data = {
    packaging_product_id: selectedProduct.value,
    quantity: formData.value.quantity,
    notes: formData.value.notes || undefined,
  };

  const result = await createOrder(data);

  if (result.success) {
    navigateTo("/orders");
  }

  submitting.value = false;
};

// Load products on mount
onMounted(() => {
  loadProducts();
});
</script>
