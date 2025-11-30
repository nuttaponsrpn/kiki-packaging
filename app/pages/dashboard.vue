<template>
  <div>
    <div class="mb-6">
      <h1 class="text-size-32 font-bold text-gray-900 dark:text-white">
        {{ t("dashboard.title") }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{ t("dashboard.subtitle") }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading">
      <!-- Stats Grid Skeleton -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-lg" />
      </div>
      <!-- Recent Activity Skeleton -->
      <div class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-20 rounded-lg" />
      </div>
    </div>

    <div v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <UCard>
          <div class="flex items-center">
            <div class="shrink-0">
              <UIcon name="i-heroicons-shopping-bag" class="h-10 w-10 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t("dashboard.totalOrders") }}
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics?.totalOrders || 0 }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard v-if="userProfile?.role === 'admin'">
          <div class="flex items-center">
            <div class="shrink-0">
              <UIcon name="i-heroicons-cube" class="h-10 w-10 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t("dashboard.totalProducts") }}
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics?.totalProducts || 0 }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard v-if="userProfile?.role === 'admin'">
          <div class="flex items-center">
            <div class="shrink-0">
              <UIcon name="i-heroicons-users" class="h-10 w-10 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t("dashboard.totalUsers") }}
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics?.totalUsers || 0 }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center">
            <div class="shrink-0">
              <UIcon name="i-heroicons-clock" class="h-10 w-10 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t("dashboard.pendingOrders") }}
              </p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ metrics?.pendingOrders || 0 }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Low Stock Alerts (Admin Only) -->
      <div v-if="userProfile?.role === 'admin' && lowStockProducts.length > 0" class="mb-8">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-heroicons-exclamation-triangle" class="text-yellow-600" />
                {{ t("packaging.lowStock") }}
              </h2>
            </div>
          </template>
          <div class="space-y-3">
            <div
              v-for="product in lowStockProducts"
              :key="product.id"
              class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ product.name }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ t("packaging.sku") }}: {{ product.sku }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-red-600">{{ product.stock_quantity }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ product.unit }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent Activity -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t("dashboard.recentActivity") }}
          </h2>
        </template>

        <div v-if="recentActivity.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-inbox" class="text-6xl text-gray-400 mb-4" />
          <p class="text-gray-500 dark:text-gray-400">{{ t("dashboard.noActivity") }}</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in recentActivity"
            :key="order.id"
            class="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
            @click="navigateTo(`/orders/${order.id}`)"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <UBadge
                  :color="getStatusColor(order.status) as any"
                  variant="subtle"
                  size="md"
                >
                  {{ getStatusLabel(order.status) }}
                </UBadge>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatDate(order.created_at) }}
                </span>
              </div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ getOrderSummary(order) }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t("orders.createdBy") }}: {{ order.user?.name || 'Unknown User' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-500">
                {{ t("orders.total") }}: ฿{{ order.total_price.toFixed(2) }}
              </p>
            </div>
            <div>
              <UIcon name="i-heroicons-chevron-right" class="text-gray-400" />
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { getMetrics, getRecentActivity, getLowStockAlerts } = useDashboard();
const userProfile = useState<any>("userProfile");

// State
const loading = ref(true);
const metrics = ref<any>(null);
const recentActivity = ref<any[]>([]);
const lowStockProducts = ref<any[]>([]);

// Methods
const loadDashboardData = async () => {
  loading.value = true;

  // Load metrics
  const metricsResult = await getMetrics();
  if (metricsResult.success) {
    metrics.value = metricsResult.data;
  }

  // Load recent activity
  const activityResult = await getRecentActivity(5);
  if (activityResult.success) {
    recentActivity.value = activityResult.data;
  }

  // Load low stock alerts
  const lowStockResult = await getLowStockAlerts(10);
  if (lowStockResult.success) {
    lowStockProducts.value = lowStockResult.data;
  }

  loading.value = false;
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

const getStatusLabel = (status: string) => {
  return t(`orders.${status}`);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getOrderSummary = (order: any) => {
  if (order.items && order.items.length > 0) {
    return order.items
      .map((item: any) => `${item.product?.name || "Unknown"} x${item.quantity}`)
      .join(", ");
  }

  // Fallback for legacy orders
  if (order.product) {
    return `${order.product.name} x${order.quantity || 1}`;
  }

  return "No items";
};

// Load data on mount
onMounted(() => {
  loadDashboardData();
});
</script>
