<template>
  <div>
    <div class="mb-6">
      <h1 class="text-size-32 font-bold text-gray-900">
        {{ t("dashboard.title") }}
      </h1>
      <p class="text-gray-600 mt-2">
        {{ t("dashboard.subtitle") }}
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="shrink-0">
            <UIcon name="i-heroicons-shopping-bag" class="h-6 w-6 text-orange-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ t("dashboard.totalOrders") }}</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="shrink-0">
            <UIcon name="i-heroicons-cube" class="h-12 w-12 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ t("dashboard.totalProducts") }}</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="shrink-0">
            <UIcon name="i-heroicons-users" class="h-12 w-12 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ t("dashboard.totalUsers") }}</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="shrink-0">
            <UIcon name="i-heroicons-clock" class="h-12 w-12 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">{{ t("dashboard.pendingOrders") }}</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ t("dashboard.recentActivity") }}
        </h2>
      </div>
      <div class="p-6">
        <p class="text-gray-500 text-center py-8">
          {{ t("dashboard.noActivity") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
