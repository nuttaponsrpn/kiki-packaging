<template>
  <div class="h-full flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {{ t("packaging.title") }}
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-lg">
          Manage your packaging inventory and products
        </p>
      </div>
      <UButton
        v-if="userProfile?.role === 'admin'"
        icon="i-heroicons-plus"
        size="lg"
        color="primary"
        class="rounded-full shadow-sm font-semibold"
        @click="openCreateModal"
      >
        {{ t("packaging.addNew") }}
      </UButton>
    </div>

    <!-- Search and Filters -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8"
    >
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <div class="flex-1 w-full">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            :placeholder="t('common.search')"
            size="lg"
            class="w-full"
          >
            <template #trailing>
              <UButton
                v-show="searchQuery !== ''"
                color="neutral"
                variant="link"
                icon="i-heroicons-x-mark"
                :padded="false"
                @click="searchQuery = ''"
              />
            </template>
          </UInput>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <USelectMenu
            v-model="selectedCategory"
            :options="categoryOptions"
            :placeholder="t('packaging.category')"
            class="w-full sm:w-48"
            size="lg"
          />
          <div
            v-if="userProfile?.role === 'admin'"
            class="flex items-center gap-2 px-2 whitespace-nowrap"
          >
            <UCheckbox
              v-model="showInactive"
              :label="t('packaging.showInactive')"
              :ui="{ label: 'text-sm font-medium text-gray-600 dark:text-gray-300' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Products Grid Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="i in 8"
        :key="i"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 h-[400px] flex flex-col gap-4"
      >
        <USkeleton class="h-48 w-full rounded-xl" />
        <USkeleton class="h-6 w-3/4" />
        <USkeleton class="h-4 w-full" />
        <div class="mt-auto flex justify-between items-center">
          <USkeleton class="h-8 w-24" />
          <USkeleton class="h-8 w-16" />
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredProducts.length === 0"
      class="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 border-dashed"
    >
      <div class="bg-gray-50 dark:bg-gray-900 p-6 rounded-full mb-6">
        <UIcon name="i-heroicons-inbox" class="text-6xl text-gray-400" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {{ searchQuery || selectedCategory ? t("common.noResults") : t("packaging.noProducts") }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md text-lg">
        {{
          searchQuery || selectedCategory
            ? "Try adjusting your search or filters to find what you're looking for."
            : "Get started by adding your first packaging product to the inventory."
        }}
      </p>
      <UButton
        v-if="userProfile?.role === 'admin' && !searchQuery && !selectedCategory"
        icon="i-heroicons-plus"
        size="xl"
        color="primary"
        class="rounded-full px-8"
        @click="openCreateModal"
      >
        {{ t("packaging.addNew") }}
      </UButton>
      <UButton
        v-else-if="searchQuery || selectedCategory"
        variant="outline"
        size="lg"
        @click="
          searchQuery = '';
          selectedCategory = null;
        "
      >
        {{ t("common.clearFilters") }}
      </UButton>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
      >
        <!-- Image Area -->
        <div class="aspect-4/3 relative bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-photo" class="text-6xl opacity-50" />
          </div>

          <!-- Status Badge -->
          <div class="absolute top-3 right-3">
            <UBadge
              :color="product.is_active ? 'success' : 'neutral'"
              variant="solid"
              class="shadow-sm backdrop-blur-md bg-opacity-90 px-2 py-1"
            >
              {{ product.is_active ? t("packaging.active") : t("packaging.inactive") }}
            </UBadge>
          </div>
        </div>

        <!-- Content -->
        <div class="p-5 flex-1 flex flex-col">
          <div class="mb-3">
            <h3
              class="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1"
              :title="product.name"
            >
              {{ product.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 leading-relaxed">
              {{ product.description || "No description available" }}
            </p>
          </div>

          <div class="mt-auto space-y-4">
            <div class="flex items-end justify-between">
              <div>
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  {{ t("packaging.unitPrice") }}
                </p>
                <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  ฿{{ product.unit_price.toFixed(2) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  {{ t("packaging.stock") }}
                </p>
                <div
                  class="flex items-center justify-end gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg"
                >
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      product.stock_quantity < 10 ? 'bg-red-500' : 'bg-green-500',
                    ]"
                  />
                  <span class="font-semibold text-gray-700 dark:text-gray-200"
                    >{{ product.stock_quantity }} {{ product.unit }}</span
                  >
                </div>
              </div>
            </div>

            <div
              class="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between"
            >
              <UBadge
                color="neutral"
                variant="subtle"
                size="xs"
                class="truncate max-w-[60%] rounded-md"
              >
                {{ product.category || "Uncategorized" }}
              </UBadge>
              <span
                class="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded"
                >{{ product.sku }}</span
              >
            </div>
          </div>
        </div>

        <!-- Admin Actions (Footer) -->
        <div
          v-if="userProfile?.role === 'admin'"
          class="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100"
        >
          <UButton
            icon="i-heroicons-pencil-square"
            size="xs"
            color="neutral"
            variant="ghost"
            @click="openEditModal(product)"
          >
            {{ t("common.edit") }}
          </UButton>
          <UButton
            v-if="product.is_active"
            icon="i-heroicons-archive-box"
            size="xs"
            color="error"
            variant="ghost"
            @click="deactivateProduct(product)"
          >
            {{ t("common.delete") }}
          </UButton>
          <UButton
            v-else
            icon="i-heroicons-arrow-path"
            size="xs"
            color="success"
            variant="ghost"
            @click="reactivateProduct(product)"
          >
            Reactivate
          </UButton>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isModalOpen" :ui="{ content: 'sm:max-w-2xl' }">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ modalTitle }}
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="-my-1"
                @click="closeModal"
              />
            </div>
          </template>

          <form class="space-y-6 p-2" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <UFormGroup :label="t('packaging.name')" required class="sm:col-span-2">
                <UInput
                  v-model="formData.name"
                  :placeholder="t('packaging.name')"
                  required
                  size="lg"
                />
              </UFormGroup>

              <UFormGroup :label="t('packaging.sku')" required>
                <UInput
                  v-model="formData.sku"
                  :placeholder="t('packaging.sku')"
                  required
                  icon="i-heroicons-qr-code"
                />
              </UFormGroup>

              <UFormGroup :label="t('packaging.category')">
                <UInput
                  v-model="formData.category"
                  :placeholder="t('packaging.category')"
                  icon="i-heroicons-tag"
                />
              </UFormGroup>

              <UFormGroup :label="t('packaging.unitPrice')" required>
                <UInput
                  v-model.number="formData.unit_price"
                  type="number"
                  :placeholder="t('packaging.unitPrice')"
                  :min="0"
                  step="0.01"
                  required
                  icon="i-heroicons-currency-dollar"
                />
              </UFormGroup>

              <UFormGroup :label="t('packaging.stockQuantity')" required>
                <div class="flex gap-2">
                  <UInput
                    v-model.number="formData.stock_quantity"
                    type="number"
                    :placeholder="t('packaging.stockQuantity')"
                    :min="0"
                    required
                    class="flex-1"
                  />
                  <UInput
                    v-model="formData.unit"
                    :placeholder="t('packaging.unit')"
                    required
                    class="w-24"
                  />
                </div>
              </UFormGroup>

              <UFormGroup :label="t('packaging.imageUrl')" class="sm:col-span-2">
                <UInput
                  v-model="formData.image_url"
                  :placeholder="t('packaging.imageUrl')"
                  type="url"
                  icon="i-heroicons-photo"
                />
                <div
                  v-if="formData.image_url"
                  class="mt-3 h-40 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center"
                >
                  <img :src="formData.image_url" class="h-full object-contain" />
                </div>
              </UFormGroup>

              <UFormGroup :label="t('packaging.description')" class="sm:col-span-2">
                <UTextarea
                  v-model="formData.description"
                  :placeholder="t('packaging.description')"
                  :rows="3"
                />
              </UFormGroup>

              <UFormGroup v-if="editingProduct" label="Status" class="sm:col-span-2">
                <UCheckbox v-model="formData.is_active" :label="t('packaging.active')" />
              </UFormGroup>
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton color="neutral" variant="ghost" @click="closeModal">
                {{ t("common.cancel") }}
              </UButton>
              <UButton type="submit" :loading="submitting" color="primary" @click="handleSubmit">
                {{ editingProduct ? t("common.save") : t("common.create") }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const userProfile = useState<any>("userProfile");
const { getAllPackaging, createPackaging, updatePackaging, deletePackaging, reactivatePackaging } =
  usePackaging();

// State
const products = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref<string | null>(null);
const showInactive = ref(false);
const isModalOpen = ref(false);
const editingProduct = ref<any>(null);
const submitting = ref(false);

const formData = ref({
  name: "",
  description: "",
  sku: "",
  unit: "",
  unit_price: 0,
  stock_quantity: 0,
  category: "",
  image_url: "",
  is_active: true,
});

// Computed
const modalTitle = computed(() =>
  editingProduct.value ? t("packaging.editProduct") : t("packaging.newProduct")
);

const categoryOptions = computed(() => {
  const categories = [...new Set(products.value.map((p) => p.category).filter(Boolean))];
  return [
    { label: "All Categories", value: null },
    ...categories.map((cat) => ({ label: cat, value: cat })),
  ];
});

const filteredProducts = computed(() => {
  let filtered = products.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category === selectedCategory.value);
  }

  // Filter by active status
  if (!showInactive.value) {
    filtered = filtered.filter((p) => p.is_active);
  }

  return filtered;
});

// Methods
const loadProducts = async () => {
  loading.value = true;
  const result = await getAllPackaging();
  if (result.success) {
    products.value = result.data;
  }
  loading.value = false;
};

const openCreateModal = () => {
  editingProduct.value = null;
  formData.value = {
    name: "",
    description: "",
    sku: "",
    unit: "",
    unit_price: 0,
    stock_quantity: 0,
    category: "",
    image_url: "",
    is_active: true,
  };
  isModalOpen.value = true;
};

const openEditModal = (product: any) => {
  editingProduct.value = product;
  formData.value = {
    name: product.name,
    description: product.description || "",
    sku: product.sku,
    unit: product.unit,
    unit_price: product.unit_price,
    stock_quantity: product.stock_quantity,
    category: product.category || "",
    image_url: product.image_url || "",
    is_active: product.is_active,
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingProduct.value = null;
};

const handleSubmit = async () => {
  submitting.value = true;

  const data = {
    ...formData.value,
    description: formData.value.description || undefined,
    category: formData.value.category || undefined,
    image_url: formData.value.image_url || undefined,
  };

  let result;
  if (editingProduct.value) {
    result = await updatePackaging(editingProduct.value.id, data);
  } else {
    result = await createPackaging(data);
  }

  if (result.success) {
    await loadProducts();
    closeModal();
  }

  submitting.value = false;
};

const deactivateProduct = async (product: any) => {
  if (confirm(t("packaging.confirmDelete"))) {
    const result = await deletePackaging(product.id);
    if (result.success) {
      await loadProducts();
    }
  }
};

const reactivateProduct = async (product: any) => {
  if (confirm(t("packaging.confirmReactivate"))) {
    const result = await reactivatePackaging(product.id);
    if (result.success) {
      await loadProducts();
    }
  }
};

// Load data on mount
onMounted(() => {
  loadProducts();
});
</script>
