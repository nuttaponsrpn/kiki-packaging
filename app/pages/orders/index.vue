<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t("orders.title") }}
        </h1>
      </div>
      <div class="flex gap-2">
        <UButton
          v-if="filteredOrders.length > 0"
          icon="i-heroicons-arrow-down-tray"
          variant="outline"
          @click="handleExport"
        >
          {{ t("common.export") }}
        </UButton>
        <UButton icon="i-heroicons-plus" size="lg" @click="navigateTo('/orders/new')">
          {{ t("orders.createNew") }}
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        :placeholder="t('common.search')"
        class="flex-1"
      />

      <UInput
        v-model="selectedMonth"
        type="month"
        :placeholder="t('common.month')"
        class="w-full sm:w-48"
      />


    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden p-6 space-y-4">
      <USkeleton v-for="i in 10" :key="i" class="h-16 rounded-lg" />
    </div>

    <!-- Orders Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-inbox" class="text-6xl text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ searchQuery || selectedMonth ? t("common.noResults") : t("orders.noOrders") }}
      </p>
      <UButton
        v-if="!searchQuery && !selectedMonth"
        icon="i-heroicons-plus"
        @click="navigateTo('/orders/new')"
      >
        {{ t("orders.createNew") }}
      </UButton>
      <UButton
        v-else
        variant="outline"
        @click="clearFilters"
      >
        {{ t("common.clearFilters") }}
      </UButton>
    </div>

    <!-- Orders List -->
    <div v-else>
      <!-- Mobile Card View (md and below) -->
      <div class="md:hidden space-y-4">
        <UCard
          v-for="order in paginatedOrders"
          :key="order.id"
          class="cursor-pointer hover:shadow-lg transition"
          @click="navigateTo(`/orders/${order.id}`)"
        >
          <div class="space-y-3">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  Order #{{ order.id.slice(0, 8) }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ getOrderSummary(order) }}
                </p>
              </div>
              <UBadge
                :color="getStatusColor(order.status) as any"
                variant="subtle"
                size="sm"
              >
                {{ t(`orders.${order.status}`) }}
              </UBadge>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500 dark:text-gray-400">{{ t("orders.total") }}:</span>
                <span class="ml-1 font-medium">฿{{ order.total_price.toFixed(2) }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">{{ t("orders.createdBy") }}:</span>
                <span class="ml-1">{{ order.user?.name || 'Unknown' }}</span>
              </div>
              <div>
                <span class="text-gray-500 dark:text-gray-400">{{ formatDate(order.created_at) }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Desktop Table View (md and above) -->
      <div class="hidden md:block bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t("orders.total") }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t("orders.status") }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t("orders.createdBy") }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t("orders.createdAt") }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t("common.actions") }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="order in paginatedOrders"
                :key="order.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    #{{ order.id.slice(0, 8) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="order.items && order.items.length > 0" class="space-y-1">
                    <div
                      v-for="item in order.items"
                      :key="item.id"
                      class="text-sm text-gray-900 dark:text-white"
                    >
                      {{ item.product?.name || "Unknown" }}
                      <span class="text-gray-500">x{{ item.quantity }}</span>
                    </div>
                  </div>
                  <div v-else-if="order.legacy_product" class="text-sm text-gray-900 dark:text-white">
                    {{ order.legacy_product.name }}
                    <span class="text-gray-500">x{{ order.quantity || 1 }}</span>
                  </div>
                  <div v-else class="text-sm text-gray-500 italic">No items</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  ฿{{ order.total_price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge
                    :color="getStatusColor(order.status) as any"
                    variant="subtle"
                    size="sm"
                  >
                    {{ t(`orders.${order.status}`) }}
                  </UBadge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ order.user?.name || 'Unknown' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <UButton
                    icon="i-heroicons-eye"
                    size="xs"
                    variant="ghost"
                    @click="navigateTo(`/orders/${order.id}`)"
                  >
                    {{ t("orders.viewDetails") }}
                  </UButton>
                  <UButton
                    v-if="canDeleteOrder(order)"
                    icon="i-heroicons-trash"
                    size="xs"
                    color="error"
                    variant="ghost"
                    @click="handleDeleteOrder(order.id)"
                  >
                    {{ t("common.delete") }}
                  </UButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
              {{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }} of
              {{ filteredOrders.length }} results
            </div>
            <div class="flex gap-2">
              <UButton
                icon="i-heroicons-chevron-left"
                size="sm"
                variant="outline"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                Previous
              </UButton>
              <UButton
                icon="i-heroicons-chevron-right"
                size="sm"
                variant="outline"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                Next
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Pagination -->
      <div v-if="totalPages > 1" class="md:hidden mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-chevron-left"
            size="sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
          />
          <UButton
            icon="i-heroicons-chevron-right"
            size="sm"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const userProfile = useState<any>("userProfile");
const { getAllOrders, deleteOrder } = useOrders();
const { exportOrdersToCSV } = useCSVExport();

// State
const orders = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedStatus = ref<string | null>(null);
const selectedMonth = ref<string>(new Date().toISOString().slice(0, 7));
const currentPage = ref(1);
const itemsPerPage = 20;

// Status options
const statusOptions = computed(() => [
  { label: "All Statuses", value: null },
  { label: t("orders.pending"), value: "pending" },
  { label: t("orders.processing"), value: "processing" },
  { label: t("orders.completed"), value: "completed" },
  { label: t("orders.cancelled"), value: "cancelled" },
]);

// Computed
const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Filter by status
  if (selectedStatus.value) {
    filtered = filtered.filter((o) => o.status === selectedStatus.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.user?.name.toLowerCase().includes(query) ||
        o.notes?.toLowerCase().includes(query) ||
        o.items?.some((item: any) => item.product?.name.toLowerCase().includes(query))
    );
  }

  // Filter by month
  if (selectedMonth.value) {
    filtered = filtered.filter((o) => o.created_at.startsWith(selectedMonth.value));
  }

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

// Methods
const loadOrders = async () => {
  loading.value = true;
  const result = await getAllOrders();
  if (result.success) {
    orders.value = result.data;
  }
  loading.value = false;
};

const getOrderSummary = (order: any) => {
  if (order.items && order.items.length > 0) {
    if (order.items.length === 1) {
      const item = order.items[0];
      return `${item.product?.name || "Unknown"} x${item.quantity}`;
    }
    return `${order.items.length} items`;
  }

  // Fallback for legacy orders
  if (order.legacy_product) {
    return `${order.legacy_product.name} x${order.quantity || 1}`;
  }

  return "No items";
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedStatus.value = null;
  selectedMonth.value = "";
  currentPage.value = 1;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "warning",
    processing: "info",
    completed: "success",
    cancelled: "error",
  };
  return colors[status] || "neutral";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const canDeleteOrder = (order: any) => {
  return userProfile.value?.role === "admin";
};

const handleDeleteOrder = async (orderId: string) => {
  if (confirm(t("orders.confirmDelete"))) {
    const result = await deleteOrder(orderId);
    if (result.success) {
      await loadOrders();
    }
  }
};

const handleExport = () => {
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `orders-${timestamp}.csv`;
  exportOrdersToCSV(filteredOrders.value, filename);
};

// Reset to page 1 when filters change
watch([searchQuery, selectedMonth], () => {
  currentPage.value = 1;
});

// Load orders on mount
onMounted(() => {
  loadOrders();
});
</script>
