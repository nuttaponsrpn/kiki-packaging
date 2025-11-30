<template>
  <div class="max-w-4xl mx-auto pb-12">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <UButton
          icon="i-heroicons-arrow-left"
          size="sm"
          color="neutral"
          variant="ghost"
          @click="navigateTo('/orders')"
        >
          Back to Orders
        </UButton>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {{ t("orders.orderDetails") }}
            <span class="text-lg font-normal text-gray-500">#{{ order?.id.slice(0, 8) }}</span>
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Created on {{ order ? formatDate(order.created_at) : "..." }}
          </p>
        </div>
        <UBadge
          v-if="order"
          :color="getStatusColor(order.status) as any"
          variant="solid"
          size="lg"
          class="px-4 py-1.5 rounded-full"
        >
          {{ t(`orders.${order.status}`) }}
        </UBadge>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-primary-500" />
    </div>

    <!-- Order Content -->
    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Items -->
      <div class="lg:col-span-2 space-y-6">
        <UCard :ui="{ root: 'p-0' }">
          <template #header>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Order Items</h2>
          </template>

          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="p-4 flex items-center gap-4"
            >
              <div class="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                <img
                  v-if="item.product?.image_url"
                  :src="item.product.image_url"
                  class="h-full w-full object-cover"
                />
                <UIcon
                  v-else
                  name="i-heroicons-photo"
                  class="h-full w-full p-4 text-gray-400"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ item.product?.name }}
                </h3>
                <p v-if="item.product?.description" class="text-xs text-gray-400 mb-1 line-clamp-1">
                  {{ item.product.description }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ item.quantity }} x ฿{{ item.unit_price.toLocaleString() }}
                </p>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-900 dark:text-white">
                  ฿{{ (item.quantity * item.unit_price).toLocaleString() }}
                </div>
              </div>
              <div v-if="canEdit" class="ml-2">
                <UButton
                  icon="i-heroicons-trash"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="handleDeleteItem(item.id)"
                />
              </div>
            </div>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-600 dark:text-gray-300">Total Amount</span>
              <span class="text-2xl font-black text-primary-600">
                ฿{{ order.total_price.toLocaleString() }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Notes -->
        <UCard v-if="order.notes">
          <template #header>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ t("orders.notes") }}</h2>
          </template>
          <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{{ order.notes }}</p>
        </UCard>
      </div>

      <!-- Right Column: Info & Actions -->
      <div class="space-y-6">
        <!-- Customer Info -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Customer</h2>
          </template>
          <div class="flex items-center gap-3">
            <UAvatar :alt="order.user?.name" size="md" />
            <div>
              <div class="font-semibold text-gray-900 dark:text-white">{{ order.user?.name }}</div>
              <div class="text-xs text-gray-500 uppercase">{{ order.user?.role || "Customer" }}</div>
            </div>
          </div>
        </UCard>


        <!-- Actions -->
        <UCard v-if="canEdit || canDelete">
          <template #header>
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">Actions</h2>
          </template>
          <div class="space-y-3">
            <template v-if="canEdit">
              <UButton
                v-if="order.status === 'pending'"
                block
                icon="i-heroicons-arrow-path"
                @click="updateStatus('processing')"
              >
                Mark as Processing
              </UButton>
              <UButton
                v-if="order.status === 'processing'"
                block
                color="success"
                icon="i-heroicons-check-circle"
                @click="updateStatus('completed')"
              >
                Mark as Completed
              </UButton>
            </template>

            <UButton
              v-if="canDelete"
              block
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="handleDeleteOrder"
            >
              Delete Order
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const route = useRoute();
const { t } = useI18n();
const userProfile = useState<any>("userProfile");
const { getOrderById, updateOrderStatus, deleteOrder, deleteOrderItem } = useOrders();

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

const updateStatus = async (status: "processing" | "completed") => {
  if (!order.value) return;
  const result = await updateOrderStatus(order.value.id, status);
  if (result.success) {
    await loadOrder();
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

const handleDeleteItem = async (itemId: string) => {
  if (!order.value) return;
  if (confirm(t("orders.confirmDeleteItem"))) {
    const result = await deleteOrderItem(order.value.id, itemId);
    if (result.success) {
      await loadOrder();
    }
  }
};

onMounted(() => {
  loadOrder();
});
</script>
