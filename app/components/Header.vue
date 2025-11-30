<template>
  <!-- Mobile/Tablet header -->
  <div
    class="sticky top-0 z-40 flex items-center gap-x-6 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm sm:px-6 lg:hidden"
  >
    <!-- Mobile menu button -->
    <button
      type="button"
      class="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
      @click="emit('toggleSidebar')"
    >
      <span class="sr-only">Open sidebar</span>
      <UIcon name="i-heroicons-bars-3" class="h-6 w-6" aria-hidden="true" />
    </button>
    <div class="flex-1 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
      {{ t("common.appName") }}
    </div>

    <!-- Mobile User Menu -->
    <div class="flex items-center gap-x-3">


      <!-- User dropdown -->
      <div class="relative">
        <button
          type="button"
          class="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
          @click.stop="showUserMenu = !showUserMenu"
        >
          <span class="sr-only">Open user menu</span>
          <div class="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
            <span class="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {{ userInitials }}
            </span>
          </div>
        </button>

        <Transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="showUserMenu"
            v-click-outside="() => (showUserMenu = false)"
            class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700"
          >
            <div class="py-1">
              <div class="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ userProfile?.name || "User" }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ userProfile?.email }}</p>
              </div>
            </div>
            <div class="border-gray-100 py-1">
              <button
                type="button"
                class="flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                @click="handleLogout"
              >
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="h-5 w-5" />
                {{ t("auth.logout") }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <!-- Desktop header -->
  <div
    class="hidden lg:flex sticky top-0 z-40 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
  >
    <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
      <div class="flex flex-1" />

      <!-- User menu -->
      <div class="flex items-center gap-x-4 lg:gap-x-6">


        <!-- User dropdown -->
        <div class="relative">
          <button
            type="button"
            class="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg"
            @click.stop="showUserMenu = !showUserMenu"
          >
            <span class="sr-only">Open user menu</span>
            <div class="flex items-center gap-x-3">
              <span class="hidden lg:flex lg:items-center">
                <span class="text-sm font-semibold leading-6 text-gray-900 dark:text-white" aria-hidden="true">
                  {{ userProfile?.name || "User" }}
                </span>
                <UIcon
                  name="i-heroicons-chevron-down"
                  class="ml-2 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
              <div class="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span class="text-sm font-semibold text-orange-600">
                  {{ userInitials }}
                </span>
              </div>
            </div>
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="showUserMenu"
              v-click-outside="() => (showUserMenu = false)"
              class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
            >
              <div class="border-t border-gray-100 dark:border-gray-700 py-1">
                <button
                  type="button"
                  class="flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  @click="handleLogout"
                >
                  <UIcon name="i-heroicons-arrow-right-on-rectangle" class="h-5 w-5" />
                  {{ t("auth.logout") }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  toggleSidebar: [];
}>();

const { t, locale } = useI18n();
const { $toast } = useNuxtApp();
const auth = useAuth();
const router = useRouter();
const { logActivity } = useActivityLogs();

// Dropdown states
const showLangMenu = ref(false);
const showUserMenu = ref(false);

// User profile state
const userProfile = useState<{ name: string; email: string; role: string } | null>("userProfile");

// Locale selection
const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value as "en" | "th";
  },
});

const localeOptions = [
  { label: "EN", value: "en" as const },
  { label: "TH", value: "th" as const },
];

// User initials
const userInitials = computed(() => {
  if (!userProfile.value?.name) return "U";
  return userProfile.value.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
});

// User menu actions
const goToProfile = () => {
  showUserMenu.value = false;
  router.push("/profile");
};

const handleLogout = async () => {
  showUserMenu.value = false;

  try {
    // Log logout activity before clearing session
    await logActivity({
      action: "logout",
      entity_type: "auth",
      entity_name: userProfile.value?.email || "User",
    });

    await auth.logout();

    // Clear user profile state
    userProfile.value = null;

    $toast.success(t("auth.logoutSuccess"));
    await router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    $toast.error("Logout failed");
  }
};

// Click outside directive
interface HTMLElementWithClickOutside extends HTMLElement {
  clickOutsideEvent?: (event: Event) => void;
}

const vClickOutside = {
  mounted(el: HTMLElementWithClickOutside, binding: { value: () => void }) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el: HTMLElementWithClickOutside) {
    if (el.clickOutsideEvent) {
      document.removeEventListener("click", el.clickOutsideEvent);
    }
  },
};
</script>
