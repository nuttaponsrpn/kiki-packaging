<template>
  <NuxtLayout name="auth">
    <div class="bg-white shadow-lg rounded-lg p-8">
      <h2 class="text-size-24 font-bold text-gray-900 mb-6">
        {{ t("auth.loginTitle") }}
      </h2>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <MyTextField
          v-model="formData.email"
          label="Email"
          placeholder="admin@example.com"
          required
        />

        <MyTextField
          v-model="formData.password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
        />

        <MyButton
          type="submit"
          variant="solid"
          :loading="loading"
          class="w-full"
          :label="t('auth.loginButton')"
        />
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          {{ t("auth.demoNote") }}
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { t } = useI18n();
const { $toast } = useNuxtApp();
const router = useRouter();
const auth = useAuth();

const formData = ref({
  email: "",
  password: "",
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    const supabase = useSupabase();

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password,
    });

    if (error) {
      $toast.error(t("auth.loginError"), error.message);
      loading.value = false;
      return;
    }

    if (!data.session) {
      $toast.error(t("auth.loginError"));
      loading.value = false;
      return;
    }

    // Save tokens
    auth.saveTokens({
      access_token: data.session.access_token,
      access_token_expires_at: new Date(data.session.expires_at! * 1000).toISOString(),
      refresh_token: data.session.refresh_token,
      refresh_token_expires_at: new Date((data.session.expires_at! + 86400) * 1000).toISOString(), // 24h from now
      token_type: data.session.token_type,
    });

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      $toast.error(t("auth.loginError"), "Failed to load user profile");
      loading.value = false;
      return;
    }

    // Set user profile state
    const userProfile = useState<{ id: string; name: string; email: string; role: string }>(
      "userProfile"
    );

    const userProfileData = profile as unknown as {
      name?: string;
      role?: string;
    } | null;

    userProfile.value = {
      id: data.user.id,
      name: userProfileData?.name || data.user.email?.split("@")[0] || "User",
      email: data.user.email!,
      role: userProfileData?.role || "staff",
    };

    $toast.success(t("auth.loginSuccess"));
    await router.push("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    $toast.error(t("auth.loginError"));
  } finally {
    loading.value = false;
  }
};
</script>
