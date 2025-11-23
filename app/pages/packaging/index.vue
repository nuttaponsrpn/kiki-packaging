<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t("packaging.title") }}
        </h1>
      </div>
      <UButton
        v-if="userProfile?.role === 'admin'"
        icon="i-heroicons-plus"
        size="lg"
        @click="openCreateModal"
      >
        {{ t("packaging.addNew") }}
      </UButton>
    </div>

    <!-- Search and Filters -->
    <div class="flex gap-4 mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        :placeholder="t('common.search')"
        class="flex-1"
      />
      <USelectMenu
        v-model="selectedCategory"
        :options="categoryOptions"
        :placeholder="t('packaging.category')"
        class="w-48"
      />
      <UCheckbox
        v-if="userProfile?.role === 'admin'"
        v-model="showInactive"
        :label="t('packaging.showInactive')"
      />
    </div>

    <!-- Products Grid Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <USkeleton v-for="i in 8" :key="i" class="h-80 rounded-lg" />
    </div>

    <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-inbox" class="text-6xl text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ searchQuery || selectedCategory ? t("common.noResults") : t("packaging.noProducts") }}
      </p>
      <UButton
        v-if="userProfile?.role === 'admin' && !searchQuery && !selectedCategory"
        icon="i-heroicons-plus"
        @click="openCreateModal"
      >
        {{ t("packaging.addNew") }}
      </UButton>
      <UButton
        v-else-if="searchQuery || selectedCategory"
        variant="outline"
        @click="searchQuery = ''; selectedCategory = null"
      >
        {{ t("common.clearFilters") }}
      </UButton>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <UCard
        v-for="product in filteredProducts"
        :key="product.id"
        :ui="{ body: { padding: 'p-4' } }"
      >
        <!-- Product Image -->
        <div class="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-cube" class="text-6xl text-gray-400" />
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-2">
          <div class="flex items-start justify-between">
            <h3 class="font-semibold text-lg">{{ product.name }}</h3>
            <UBadge :color="product.is_active ? 'green' : 'gray'" variant="subtle" size="xs">
              {{ product.is_active ? t("packaging.active") : t("packaging.inactive") }}
            </UBadge>
          </div>

          <p
            v-if="product.description"
            class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
          >
            {{ product.description }}
          </p>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ t("packaging.sku") }}:</span>
            <span class="font-mono">{{ product.sku }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ t("packaging.unitPrice") }}:</span>
            <span class="font-semibold">฿{{ product.unit_price.toFixed(2) }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ t("packaging.stock") }}:</span>
            <span
              :class="{
                'text-red-600 font-semibold': product.stock_quantity < 10,
                'text-green-600': product.stock_quantity >= 10,
              }"
            >
              {{ product.stock_quantity }} {{ product.unit }}
            </span>
          </div>

          <div v-if="product.category" class="flex items-center justify-between text-sm">
            <span class="text-gray-500">{{ t("packaging.category") }}:</span>
            <UBadge color="blue" variant="subtle" size="xs">{{ product.category }}</UBadge>
          </div>
        </div>

        <!-- Actions -->
        <template #footer>
          <div class="flex gap-2">
            <UButton
              v-if="userProfile?.role === 'admin'"
              icon="i-heroicons-pencil"
              size="sm"
              color="gray"
              variant="ghost"
              @click="openEditModal(product)"
            >
              {{ t("common.edit") }}
            </UButton>
            <UButton
              v-if="userProfile?.role === 'admin' && product.is_active"
              icon="i-heroicons-archive-box"
              size="sm"
              color="red"
              variant="ghost"
              @click="deactivateProduct(product)"
            >
              {{ t("common.delete") }}
            </UButton>
            <UButton
              v-if="userProfile?.role === 'admin' && !product.is_active"
              icon="i-heroicons-arrow-path"
              size="sm"
              color="green"
              variant="ghost"
              @click="reactivateProduct(product)"
            >
              Reactivate
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Create/Edit Modal -->
    <UModal v-model:open="isModalOpen" :title="modalTitle">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">{{ modalTitle }}</h3>
          </template>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <UFormGroup :label="t('packaging.name')" required>
              <UInput v-model="formData.name" :placeholder="t('packaging.name')" required />
            </UFormGroup>

            <UFormGroup :label="t('packaging.description')">
              <UTextarea
                v-model="formData.description"
                :placeholder="t('packaging.description')"
                :rows="3"
              />
            </UFormGroup>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup :label="t('packaging.sku')" required>
                <UInput v-model="formData.sku" :placeholder="t('packaging.sku')" required />
              </UFormGroup>

              <UFormGroup :label="t('packaging.unit')" required>
                <UInput v-model="formData.unit" :placeholder="t('packaging.unit')" required />
              </UFormGroup>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormGroup :label="t('packaging.unitPrice')" required>
                <UInput
                  v-model.number="formData.unit_price"
                  type="number"
                  :placeholder="t('packaging.unitPrice')"
                  :min="0"
                  step="0.01"
                  required
                />
              </UFormGroup>

              <UFormGroup :label="t('packaging.stockQuantity')" required>
                <UInput
                  v-model.number="formData.stock_quantity"
                  type="number"
                  :placeholder="t('packaging.stockQuantity')"
                  :min="0"
                  required
                />
              </UFormGroup>
            </div>

            <UFormGroup :label="t('packaging.category')">
              <UInput v-model="formData.category" :placeholder="t('packaging.category')" />
            </UFormGroup>

            <UFormGroup :label="t('packaging.imageUrl')">
              <UInput
                v-model="formData.image_url"
                :placeholder="t('packaging.imageUrl')"
                type="url"
              />
            </UFormGroup>

            <UFormGroup v-if="editingProduct" label="Status">
              <UCheckbox v-model="formData.is_active" :label="t('packaging.active')" />
            </UFormGroup>

            <div class="flex justify-end gap-3 pt-4">
              <UButton type="button" color="gray" variant="ghost" @click="closeModal">
                {{ t("common.cancel") }}
              </UButton>
              <UButton type="submit" :loading="submitting">
                {{ editingProduct ? t("common.save") : t("common.create") }}
              </UButton>
            </div>
          </form>
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
