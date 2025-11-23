<template>
  <div class="max-w-4xl mx-auto">
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
          Back to Orders
        </UButton>
      </div>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t("orders.orderDetails") }}
        </h1>
        <UBadge
          v-if="order"
          :color="getStatusColor(order.status)"
          variant="subtle"
          size="lg"
        >
          {{ t(`orders.${order.status}`) }}
        </UBadge>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-orange-600" />
      <span class="ml-3">{{ t("common.loading") }}</span>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="space-y-6">
      <!-- Main Info Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Order Information</h2>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {{ t("orders.product") }}
            </h3>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ order.product?.name }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              SKU: {{ order.product?.sku }}
            </p>
            <p v-if="order.product?.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {{ order.product.description }}
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {{ t("orders.quantity") }}
              </h3>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ order.quantity }} {{ order.product?.unit }}
              </p>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {{ t("orders.total") }}
              </h3>
              <p class="text-2xl font-bold text-orange-600">
                ฿{{ order.total_price.toFixed(2) }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ฿{{ order.product?.unit_price.toFixed(2) }} per {{ order.product?.unit }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="order.notes" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {{ t("orders.notes") }}
          </h3>
          <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ order.notes }}</p>
        </div>
      </UCard>

      <!-- Order Details Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Order History</h2>
        </template>

        <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t("orders.createdBy") }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ order.user?.name }}
              <span class="text-gray-500 dark:text-gray-400">({{ order.user?.role }})</span>
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t("orders.createdAt") }}
            </dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.created_at) }}
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
            <dd class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ formatDate(order.updated_at) }}
            </dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ t("orders.status") }}
            </dt>
            <dd class="mt-1">
              <UBadge :color="getStatusColor(order.status)" variant="subtle">
                {{ t(`orders.${order.status}`) }}
              </UBadge>
            </dd>
          </div>
        </dl>
      </UCard>

      <!-- Actions Card -->
      <UCard v-if="canEdit || canDelete">
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Actions</h2>
        </template>

        <div class="flex flex-wrap gap-3">
          <!-- Status Actions -->
          <template v-if="canEdit">
            <UButton
              v-if="order.status === 'pending'"
              icon="i-heroicons-arrow-path"
              @click="updateStatus('processing')"
            >
              {{ t("orders.markProcessing") }}
            </UButton>
            <UButton
              v-if="order.status === 'processing'"
              icon="i-heroicons-check-circle"
              @click="updateStatus('completed')"
            >
              {{ t("orders.markCompleted") }}
            </UButton>
            <UButton
              v-if="order.status !== 'cancelled' && order.status !== 'completed'"
              icon="i-heroicons-x-circle"
              color="red"
              variant="outline"
              @click="handleCancelOrder"
            >
              {{ t("orders.cancelOrder") }}
            </UButton>
          </template>

          <!-- Delete Action (Admin Only) -->
          <UButton
            v-if="canDelete"
            icon="i-heroicons-trash"
            color="red"
            variant="ghost"
            @click="handleDeleteOrder"
          >
            {{ t("common.delete") }}
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Not Found -->
    <UCard v-else>
      <div class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-6xl text-gray-400 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Order not found</p>
        <UButton class="mt-4" @click="navigateTo('/orders')">
          Back to Orders
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const route = useRoute();
const { t } = useI18n();
const userProfile = useState<any>("userProfile");
const { getOrderById, updateOrderStatus, deleteOrder, cancelOrder } = useOrders();

// State
const order = ref<any>(null);
const loading = ref(true);

// Computed
const canEdit = computed(() => {
  if (!order.value) return false;
  const isOwner = order.value.user_id === userProfile.value?.id;
  const isAdmin = userProfile.value?.role === "admin";
  return isAdmin || (isOwner && order.value.status === "pending");
});

const canDelete = computed(() => {
  return userProfile.value?.role === "admin";
});

// Methods
const loadOrder = async () => {
  loading.value = true;
  const orderId = route.params.id as string;
  const result = await getOrderById(orderId);
  if (result.success) {
    order.value = result.data;
  }
  loading.value = false;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "yellow",
    processing: "blue",
    completed: "green",
    cancelled: "red",
  };
  return colors[status] || "gray";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const updateStatus = async (status: "processing" | "completed") => {
  if (!order.value) return;

  const result = await updateOrderStatus(order.value.id, status);
  if (result.success) {
    await loadOrder();
  }
};

const handleCancelOrder = async () => {
  if (!order.value) return;

  if (confirm(t("orders.confirmCancel"))) {
    const result = await cancelOrder(order.value.id);
    if (result.success) {
      await loadOrder();
    }
  }
};

const handleDeleteOrder = async () => {
  if (!order.value) return;

  if (confirm(t("orders.confirmDelete"))) {
    const result = await deleteOrder(order.value.id);
    if (result.success) {
      navigateTo("/orders");
    }
  }
};

// Load order on mount
onMounted(() => {
  loadOrder();
});
</script>
