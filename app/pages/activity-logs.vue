<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ t("activityLogs.title") }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{ t("activityLogs.subtitle") }}
      </p>
    </div>

    <!-- Filters -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        :placeholder="t('common.search')"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <USkeleton v-for="i in 10" :key="i" class="h-20 rounded-lg" />
    </div>

    <!-- Empty State -->
    <div v-else-if="logs.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-clock" class="text-6xl text-gray-400 mb-4" />
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery || selectedAction || selectedEntityType ? t("common.noResults") : t("activityLogs.noLogs") }}
      </p>
    </div>

    <!-- Activity Logs Table -->
    <UCard v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t("activityLogs.time") }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t("activityLogs.user") }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t("activityLogs.action") }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t("activityLogs.entity") }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {{ t("activityLogs.details") }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in paginatedLogs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(log.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ (log as any).user?.name || 'Unknown' }}
                  </div>
                  <div class="text-gray-500 dark:text-gray-400">
                    {{ (log as any).user?.email || '-' }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="getActionColor(log.action)" variant="subtle" size="md">
                  {{ t(`activityLogs.actions.${log.action}`) }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ log.entity_name || '-' }}
                  </div>
                  <div class="text-gray-500 dark:text-gray-400">
                    {{ t(`activityLogs.entityTypes.${log.entity_type}`) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                <template v-if="log.details">
                  <div class="max-w-xs truncate">
                    {{ formatDetails(log.details) }}
                  </div>
                </template>
                <template v-else>
                  -
                </template>
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
            {{ Math.min(currentPage * itemsPerPage, filteredLogs.length) }} of
            {{ filteredLogs.length }} results
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
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ActivityLog } from "~/composables/useActivityLogs";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { getAllActivityLogs } = useActivityLogs();
const userProfile = useState<any>("userProfile");

// Redirect if not admin
if (userProfile.value?.role !== "admin") {
  navigateTo("/dashboard");
}

// State
const loading = ref(true);
const logs = ref<ActivityLog[]>([]);
const searchQuery = ref("");
const selectedAction = ref<string | null>(null);
const selectedEntityType = ref<string | null>(null);
const currentPage = ref(1);
const itemsPerPage = 20;

// Options
const actionOptions = [
  { label: "All Actions", value: null },
  { label: t("activityLogs.actions.create"), value: "create" },
  { label: t("activityLogs.actions.update"), value: "update" },
  { label: t("activityLogs.actions.delete"), value: "delete" },
  { label: t("activityLogs.actions.login"), value: "login" },
  { label: t("activityLogs.actions.logout"), value: "logout" },
  { label: t("activityLogs.actions.invite"), value: "invite" },
  { label: t("activityLogs.actions.accept_invitation"), value: "accept_invitation" },
  { label: t("activityLogs.actions.cancel"), value: "cancel" },
  { label: t("activityLogs.actions.reactivate"), value: "reactivate" },
  { label: t("activityLogs.actions.status_change"), value: "status_change" },
  { label: t("activityLogs.actions.delete_item"), value: "delete_item" },
];

const entityTypeOptions = [
  { label: "All Types", value: null },
  { label: t("activityLogs.entityTypes.packaging"), value: "packaging" },
  { label: t("activityLogs.entityTypes.order"), value: "order" },
  { label: t("activityLogs.entityTypes.user"), value: "user" },
  { label: t("activityLogs.entityTypes.invitation"), value: "invitation" },
  { label: t("activityLogs.entityTypes.auth"), value: "auth" },
];

// Computed
const filteredLogs = computed(() => {
  let filtered = logs.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((log) =>
      log.entity_name?.toLowerCase().includes(query) ||
      (log as any).user?.name?.toLowerCase().includes(query) ||
      (log as any).user?.email?.toLowerCase().includes(query)
    );
  }

  // Filter by action
  if (selectedAction.value) {
    filtered = filtered.filter((log) => log.action === selectedAction.value);
  }

  // Filter by entity type
  if (selectedEntityType.value) {
    filtered = filtered.filter((log) => log.entity_type === selectedEntityType.value);
  }

  return filtered;
});

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredLogs.value.slice(start, end);
});

// Methods
const loadLogs = async () => {
  loading.value = true;
  const result = await getAllActivityLogs({ limit: 1000 });
  if (result.success) {
    logs.value = result.data;
  }
  loading.value = false;
};

const clearFilters = () => {
  searchQuery.value = "";
  selectedAction.value = null;
  selectedEntityType.value = null;
  currentPage.value = 1;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    create: "success",
    created: "success",
    update: "info",
    delete: "error",
    login: "primary",
    logout: "warning",
    invite: "warning",
    accept_invitation: "success",
    cancel: "error",
    reactivate: "success",
    status_change: "info",
    status_changed: "info",
    delete_item: "error",
  };
  return (colors[action] || "neutral") as any;
};

const formatDetails = (details: Record<string, any>) => {
  return JSON.stringify(details, null, 2);
};

// Load data on mount
onMounted(() => {
  loadLogs();
});

// Reset page when filters change
watch([selectedAction, selectedEntityType, searchQuery], () => {
  currentPage.value = 1;
});
</script>
