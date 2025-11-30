<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-900">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div class="space-y-1">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            {{ t("packaging.title") }}
          </h1>
          <p class="text-lg text-gray-500 dark:text-gray-400 font-medium">
            Manage your product inventory with ease
          </p>
        </div>
        <UButton
          v-if="userProfile?.role === 'admin'"
          icon="i-heroicons-plus"
          size="xl"
          color="primary"
          class="rounded-full shadow-lg hover:shadow-primary-500/25 transition-all duration-300 font-bold px-6"
          @click="openCreateModal"
        >
          {{ t("packaging.addNew") }}
        </UButton>
      </div>

      <!-- Filters & Search Bar -->
      <div
        class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-2 mb-10 sticky top-4 z-30 backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90"
      >
        <div class="flex flex-col md:flex-row gap-2">
          <div class="flex-1 relative group">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              :placeholder="t('common.search')"
              size="xl"
              :ui="{
                base: 'rounded-2xl shadow-none ring-0 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-transparent',
                trailing: 'pointer-events-auto',
              }"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  v-show="searchQuery !== ''"
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  :padded="false"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>
          </div>

          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <USelectMenu
              v-model="selectedCategory"
              :options="categoryOptions"
              :placeholder="t('packaging.category')"
              class="w-48 flex-shrink-0"
              size="xl"
              :ui="{ base: 'rounded-2xl' }"
            >
              <template #leading>
                <UIcon name="i-heroicons-tag" class="w-5 h-5 text-gray-400" />
              </template>
            </USelectMenu>

            <div
              v-if="userProfile?.role === 'admin'"
              class="flex items-center px-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600 flex-shrink-0 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="showInactive = !showInactive"
            >
              <UCheckbox
                v-model="showInactive"
                :label="t('packaging.showInactive')"
                :ui="{
                  base: 'cursor-pointer',
                  label: 'text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer',
                }"
                @click.stop
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
      >
        <div
          v-for="i in 10"
          :key="i"
          class="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-4 h-[420px] flex flex-col gap-4 animate-pulse"
        >
          <div class="h-56 bg-gray-100 dark:bg-gray-700 rounded-2xl w-full" />
          <div class="space-y-3 px-2">
            <div class="h-6 bg-gray-100 dark:bg-gray-700 rounded-full w-3/4" />
            <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-full" />
            <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded-full w-2/3" />
          </div>
          <div class="mt-auto flex justify-between items-center px-2">
            <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-24" />
            <div class="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg w-16" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredProducts.length === 0"
        class="flex flex-col items-center justify-center py-32 text-center"
      >
        <div
          class="bg-white dark:bg-gray-800 p-8 rounded-full shadow-xl shadow-gray-100 dark:shadow-none mb-8 ring-1 ring-gray-100 dark:ring-gray-700"
        >
          <UIcon name="i-heroicons-cube" class="text-7xl text-primary-500" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {{ searchQuery || selectedCategory ? t("common.noResults") : t("packaging.noProducts") }}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-10 max-w-md text-lg leading-relaxed">
          {{
            searchQuery || selectedCategory
              ? "We couldn't find any products matching your filters. Try adjusting your search terms."
              : "Your inventory is empty. Start by adding your first packaging product."
          }}
        </p>
        <div class="flex gap-4">
          <UButton
            v-if="userProfile?.role === 'admin' && !searchQuery && !selectedCategory"
            icon="i-heroicons-plus"
            size="xl"
            color="primary"
            class="rounded-full px-8 font-bold shadow-lg shadow-primary-500/20"
            @click="openCreateModal"
          >
            {{ t("packaging.addNew") }}
          </UButton>
          <UButton
            v-else-if="searchQuery || selectedCategory"
            variant="soft"
            size="xl"
            color="neutral"
            class="rounded-full px-8 font-medium"
            @click="
              searchQuery = '';
              selectedCategory = null;
            "
          >
            {{ t("common.clearFilters") }}
          </UButton>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pb-12"
      >
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="group relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1.5 transition-all duration-500 flex flex-col overflow-hidden cursor-pointer"
          @click="openEditModal(product)"
        >
          <!-- Image Area -->
          <div class="aspect-[4/3] relative overflow-hidden bg-gray-50 dark:bg-gray-900/50">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors"
            >
              <UIcon name="i-heroicons-photo" class="text-6xl opacity-50 mb-2" />
              <span class="text-xs font-medium uppercase tracking-wider opacity-50">No Image</span>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-4 right-4 flex gap-2">
              <UBadge
                v-if="!product.is_active"
                color="neutral"
                variant="solid"
                class="shadow-sm backdrop-blur-md bg-white/90 dark:bg-gray-900/90 px-3 py-1.5 rounded-full font-bold"
              >
                {{ t("packaging.inactive") }}
              </UBadge>
              <UBadge
                v-else-if="product.stock_quantity < 10"
                color="error"
                variant="solid"
                class="shadow-sm backdrop-blur-md bg-red-500/90 px-3 py-1.5 rounded-full font-bold animate-pulse"
              >
                {{ t("packaging.lowStock") }}
              </UBadge>
            </div>


          </div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <div class="mb-4">
              <div class="flex justify-between items-start gap-2 mb-2">
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="xs"
                  class="rounded-full px-2.5 py-0.5 font-semibold"
                >
                  {{ product.category || "General" }}
                </UBadge>
                <span class="text-xs font-mono text-gray-400 font-medium tracking-wide">
                  {{ product.sku }}
                </span>
              </div>
              <h3
                class="font-bold text-xl text-gray-900 dark:text-white line-clamp-1 mb-2 group-hover:text-primary-500 transition-colors"
                :title="product.name"
              >
                {{ product.name }}
              </h3>
              <p
                class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 leading-relaxed font-medium"
              >
                {{ product.description || "No description available for this product." }}
              </p>
            </div>

            <div
              class="mt-auto pt-5 border-t border-gray-50 dark:border-gray-700/50 flex items-end justify-between"
            >
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Price
                </p>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black text-gray-900 dark:text-white">
                    ฿{{ product.unit_price.toLocaleString() }}
                  </span>
                  <span class="text-xs text-gray-400 font-medium">/ {{ product.unit }}</span>
                </div>
              </div>

              <div class="text-right">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  In Stock
                </p>
                <div
                  class="flex items-center justify-end gap-2 bg-gray-50 dark:bg-gray-700/30 px-3 py-1.5 rounded-xl"
                >
                  <div
                    :class="[
                      'w-2.5 h-2.5 rounded-full shadow-sm',
                      product.stock_quantity < 10
                        ? 'bg-red-500 shadow-red-500/50'
                        : 'bg-emerald-500 shadow-emerald-500/50',
                    ]"
                  />
                  <span class="font-bold text-gray-700 dark:text-gray-200 text-sm">
                    {{ product.stock_quantity.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <UModal
        v-model:open="isModalOpen"
        :ui="{
          content: 'sm:max-w-2xl rounded-3xl',
          overlay: 'bg-gray-900/20 backdrop-blur-sm',
        }"
      >
        <template #content>
          <UCard
            :ui="{
              root: 'ring-0 divide-y divide-gray-100 dark:divide-gray-800 flex flex-col max-h-[85vh]',
              header: 'px-8 py-6 flex-shrink-0',
              body: 'px-8 py-8 overflow-y-auto',
              footer: 'px-8 py-6 flex-shrink-0',
            }"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ modalTitle }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    {{
                      editingProduct
                        ? "Update product details and inventory"
                        : "Add a new item to your packaging inventory"
                    }}
                  </p>
                </div>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  class="-my-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  size="lg"
                  @click="closeModal"
                />
              </div>
            </template>

            <form class="space-y-8" @submit.prevent="handleSubmit">
              <div class="space-y-8">
                <!-- Image Upload Section -->
                <div class="flex justify-center">
                  <div class="relative group">
                    <div
                      class="w-40 h-40 rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center transition-all duration-300 group-hover:border-primary-500 group-hover:bg-primary-50/50 dark:group-hover:bg-primary-900/10"
                    >
                      <img
                        v-if="formData.image_url"
                        :src="formData.image_url"
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-else
                        class="flex flex-col items-center text-gray-400 group-hover:text-primary-500 transition-colors"
                      >
                        <UIcon name="i-heroicons-photo" class="text-4xl mb-2" />
                        <span class="text-xs font-medium">Image Preview</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Product Details -->
                <div class="space-y-5">
                  <div class="flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                    <div
                      class="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    >
                      <UIcon name="i-heroicons-cube" class="w-5 h-5" />
                    </div>
                    <h4 class="font-bold text-lg">Product Details</h4>
                  </div>

                  <div class="grid gap-6">
                    <UFormGroup :label="t('packaging.name')" required>
                      <UInput
                        v-model="formData.name"
                        :placeholder="t('packaging.name')"
                        icon="i-heroicons-tag"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'rounded-2xl' }"
                      />
                    </UFormGroup>

                    <UFormGroup :label="t('packaging.description')">
                      <UTextarea
                        v-model="formData.description"
                        placeholder="Describe your product..."
                        :rows="3"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'rounded-2xl w-full' }"
                      />
                    </UFormGroup>

                    <UFormGroup :label="t('packaging.imageUrl')">
                      <UInput
                        v-model="formData.image_url"
                        placeholder="https://..."
                        icon="i-heroicons-link"
                        size="xl"
                        class="w-full"
                        :ui="{ base: 'rounded-2xl' }"
                      />
                    </UFormGroup>
                  </div>
                </div>

                <!-- Inventory & Pricing -->
                <div class="space-y-5">
                  <div class="flex items-center gap-3 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                    <div
                      class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    >
                      <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5" />
                    </div>
                    <h4 class="font-bold text-lg">Inventory & Pricing</h4>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <UFormGroup :label="t('packaging.unitPrice')" required>
                      <UInput
                        v-model.number="formData.unit_price"
                        type="number"
                        placeholder="0.00"
                        icon="i-heroicons-banknotes"
                        size="xl"
                        :ui="{ base: 'rounded-2xl' }"
                      />
                    </UFormGroup>

                    <UFormGroup :label="t('packaging.stockQuantity')" required>
                      <div class="flex gap-3">
                        <UInput
                          v-model.number="formData.stock_quantity"
                          type="number"
                          placeholder="0"
                          icon="i-heroicons-archive-box"
                          class="flex-1"
                          size="xl"
                          :ui="{ base: 'rounded-2xl' }"
                        />
                        <UInput
                          v-model="formData.unit"
                          placeholder="Unit"
                          class="w-28"
                          size="xl"
                          :ui="{ base: 'rounded-2xl' }"
                        />
                      </div>
                    </UFormGroup>
                  </div>
                </div>

                <!-- Status (Edit Mode Only) -->
                <div
                  v-if="editingProduct"
                  class="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div
                        :class="[
                          'p-2.5 rounded-full flex items-center justify-center',
                          formData.is_active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500',
                        ]"
                      >
                        <UIcon
                          :name="formData.is_active ? 'i-heroicons-check' : 'i-heroicons-no-symbol'"
                          class="w-6 h-6"
                        />
                      </div>
                      <div>
                        <p class="font-bold text-gray-900 dark:text-white">Product Status</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          {{
                            formData.is_active
                              ? "Product is visible and available for orders"
                              : "Product is hidden from inventory"
                          }}
                        </p>
                      </div>
                    </div>
                    <UToggle v-model="formData.is_active" size="lg" />
                  </div>
                </div>
              </div>
            </form>

            <template #footer>
              <div class="flex justify-between items-center w-full">
                <div>
                  <UButton
                    v-if="editingProduct && editingProduct.is_active"
                    color="error"
                    variant="ghost"
                    icon="i-heroicons-trash"
                    size="lg"
                    class="rounded-xl font-medium px-4 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    @click="deactivateProduct(editingProduct); closeModal()"
                  >
                    {{ t("common.delete") }}
                  </UButton>
                  <UButton
                    v-else-if="editingProduct && !editingProduct.is_active"
                    color="success"
                    variant="ghost"
                    icon="i-heroicons-arrow-path"
                    size="lg"
                    class="rounded-xl font-medium px-4 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                    @click="reactivateProduct(editingProduct); closeModal()"
                  >
                    {{ t("packaging.reactivate") }}
                  </UButton>
                </div>
                <div class="flex gap-4">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="lg"
                    class="rounded-xl font-medium px-6"
                    @click="closeModal"
                  >
                    {{ t("common.cancel") }}
                  </UButton>
                  <UButton
                    type="submit"
                    :loading="submitting"
                    color="primary"
                    size="lg"
                    class="rounded-xl font-bold px-8 shadow-lg shadow-primary-500/20"
                    @click="handleSubmit"
                  >
                    {{ editingProduct ? t("common.save") : t("common.create") }}
                  </UButton>
                </div>
              </div>
            </template>
          </UCard>
        </template>
      </UModal>
    </div>
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
    sku: formData.value.sku || `PKG-${Date.now()}`,
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

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
