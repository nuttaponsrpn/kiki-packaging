<template>
  <!-- Sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
    <div
      class="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <!-- Logo -->
      <div class="flex h-16 shrink-0 items-center">
        <img src="/favicon.ico" alt="Kiki Packaging" class="h-10 w-auto rounded-full mr-2" />
        <h2 class="text-size-20 font-bold text-orange-600 dark:text-orange-500">
          {{ t("common.appName") }}
        </h2>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <li v-for="item in navigation" :key="item.name">
                <NuxtLink
                  :to="item.href"
                  :class="[
                    isActive(item.href)
                      ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-500'
                      : 'text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6',
                  ]"
                >
                  <UIcon
                    :name="item.icon"
                    :class="[
                      isActive(item.href)
                        ? 'text-orange-600 dark:text-orange-500'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-600 dark:group-hover:text-orange-500',
                      'h-6 w-6 shrink-0',
                    ]"
                    aria-hidden="true"
                  />
                  {{ item.name }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </div>

  <!-- Mobile sidebar -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-gray-900/80 z-40 lg:hidden"
        @click="emit('close')"
      />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl lg:hidden overflow-y-auto"
      >
        <div class="flex grow flex-col gap-y-5 px-6 pb-4">
          <div class="flex h-16 shrink-0 items-center justify-between">
            <img src="/favicon.ico" alt="Kiki Packaging" class="h-10 w-auto rounded-full mr-1" />
            <h2 class="text-size-18 font-bold text-orange-600">
              {{ t("common.appName") }}
            </h2>
            <button type="button" class="-m-2.5 p-2.5" @click="emit('close')">
              <span class="sr-only">{{ t("common.closeSidebar") }}</span>
              <UIcon name="i-heroicons-x-mark" class="h-6 w-6 text-gray-400" aria-hidden="true" />
            </button>
          </div>
          <nav class="flex flex-1 flex-col">
            <ul role="list" class="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" class="-mx-2 space-y-1">
                  <li v-for="item in navigation" :key="item.name">
                    <NuxtLink
                      :to="item.href"
                      :class="[
                        isActive(item.href)
                          ? 'bg-orange-50 text-orange-600'
                          : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-orange-500 dark:hover:bg-gray-800/50',
                        'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6',
                      ]"
                      @click="emit('close')"
                    >
                      <UIcon
                        :name="item.icon"
                        :class="[
                          isActive(item.href)
                            ? 'text-orange-600'
                            : 'text-gray-400 group-hover:text-orange-600',
                          'h-6 w-6 shrink-0',
                        ]"
                        aria-hidden="true"
                      />
                      {{ item.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const route = useRoute();

import type { UserProfile } from "~/types/user";

const userProfile = useState<UserProfile | null>("userProfile");

const navigation = computed(() => {
  const items = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: "i-heroicons-home" },
    { name: t("nav.orders"), href: "/orders", icon: "i-heroicons-shopping-cart" },
  ];

  if (userProfile.value?.role === "admin") {
    items.push(
      { name: t("nav.packaging"), href: "/packaging", icon: "i-heroicons-cube" },
      { name: t("nav.users"), href: "/users", icon: "i-heroicons-users" },
      { name: t("nav.activityLogs"), href: "/activity-logs", icon: "i-heroicons-document-text" },
    );
  }

  return items;
});

const isActive = (href: string) => {
  return route.path === href || route.path.startsWith(href + "/");
};
</script>
