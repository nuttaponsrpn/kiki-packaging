<template>
  <NuxtLayout name="auth">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <!-- Loading State -->
      <div v-if="validating" class="text-center py-8">
        <Icon
          name="heroicons:arrow-path"
          class="w-12 h-12 mx-auto mb-4 animate-spin text-primary-600"
        />
        <p class="text-gray-600">{{ t("common.loading") }}</p>
      </div>

      <!-- Invalid/Expired Token -->
      <div v-else-if="!validToken" class="text-center py-8">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 mx-auto mb-4 text-red-600" />
        <h2 class="text-size-24 font-bold text-gray-900 mb-4">
          {{ t("invitations.invalidToken") }}
        </h2>
        <p class="text-gray-600 mb-6">
          {{
            tokenError === "Token expired"
              ? t("invitations.tokenExpired")
              : t("invitations.invalidToken")
          }}
        </p>
        <MyButton variant="solid" :label="t('auth.loginButton')" @click="$router.push('/login')" />
      </div>

      <!-- Accept Invitation Form -->
      <div v-else>
        <div class="text-center mb-8">
          <Icon name="heroicons:envelope-open" class="w-16 h-16 mx-auto mb-4 text-primary-600" />
          <h2 class="text-size-24 font-bold text-gray-900 mb-2">
            {{ t("invitations.welcomeTitle") }}
          </h2>
          <p class="text-gray-600">
            {{ t("invitations.welcomeMessage") }}
          </p>
        </div>

        <div v-if="invitation" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500">{{ t("users.name") }}:</span>
              <span class="ml-2 font-medium text-gray-900">{{ invitation.name }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t("users.email") }}:</span>
              <span class="ml-2 font-medium text-gray-900">{{ invitation.email }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t("users.role") }}:</span>
              <span class="ml-2 font-medium text-gray-900">{{
                t(`users.${invitation.role}`)
              }}</span>
            </div>
            <div>
              <span class="text-gray-500">{{ t("invitations.expiresAt") }}:</span>
              <span class="ml-2 font-medium text-gray-900">{{
                formatDate(invitation.expires_at)
              }}</span>
            </div>
          </div>
        </div>

        <form class="space-y-6" @submit.prevent="handleAccept">
          <MyTextField
            v-model="formData.password"
            :label="t('invitations.setPassword')"
            type="password"
            :placeholder="t('auth.password')"
            required
          />

          <MyTextField
            v-model="formData.confirmPassword"
            :label="t('invitations.confirmPassword')"
            type="password"
            :placeholder="t('invitations.confirmPassword')"
            required
          />

          <div v-if="passwordError" class="text-sm text-red-600">
            {{ passwordError }}
          </div>

          <MyButton
            type="submit"
            variant="solid"
            :loading="submitting"
            class="w-full"
            :label="t('invitations.acceptInvitation')"
          />
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: [],
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const invitations = useInvitations();

// State
const validating = ref(true);
const validToken = ref(false);
const tokenError = ref("");
const invitation = ref<{
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  expires_at: string;
} | null>(null);
const submitting = ref(false);
const passwordError = ref("");

const formData = ref({
  password: "",
  confirmPassword: "",
});

// Validate token on mount
onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    validating.value = false;
    validToken.value = false;
    tokenError.value = "No token provided";
    return;
  }

  const result = await invitations.validateToken(token);

  validating.value = false;

  if (result.valid) {
    validToken.value = true;
    invitation.value = (
      "invitation" in result ? result.invitation : null
    ) as typeof invitation.value;
  } else {
    validToken.value = false;
    tokenError.value = result.error || "Invalid token";
  }
});

// Handle accept invitation
const handleAccept = async () => {
  // Validate passwords match
  if (formData.value.password !== formData.value.confirmPassword) {
    passwordError.value = t("invitations.passwordMismatch");
    return;
  }

  // Validate password length
  if (formData.value.password.length < 8) {
    passwordError.value = t("validationErrors.passwordMinLength");
    return;
  }

  passwordError.value = "";
  submitting.value = true;

  const token = route.query.token as string;
  const result = await invitations.acceptInvitation(token, formData.value.password);

  submitting.value = false;

  if (result.success) {
    // Redirect to dashboard
    await router.push("/dashboard");
  }
};

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};
</script>
