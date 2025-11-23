/**
 * Auth Plugin
 * Restores user profile from Supabase on page refresh
 */

export default defineNuxtPlugin(async () => {
  if (import.meta.server) return;

  const auth = useAuth();
  const supabase = useSupabase();
  const userProfile = useState<{ id: string; name: string; email: string; role: string } | null>(
    "userProfile"
  );
  // Start with loading TRUE if user is authenticated
  const isLoadingProfile = useState<boolean>("isLoadingProfile", () => auth.isAuthenticated());

  // Only restore profile if authenticated and profile not already set
  if (auth.isAuthenticated() && !userProfile.value) {
    try {
      // Get current session from Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile from database
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && profile) {
          const userProfileData = profile as unknown as {
            name?: string;
            role?: string;
          } | null;

          userProfile.value = {
            id: session.user.id,
            name: userProfileData?.name || session.user.email?.split("@")[0] || "User",
            email: session.user.email!,
            role: userProfileData?.role || "staff",
          };
        } else {
          console.error("Failed to load user profile:", error);
          // Clear tokens if profile fetch fails
          auth.clearTokens();
        }
      }
    } catch (error) {
      console.error("Auth plugin error:", error);
      // Clear tokens on error
      auth.clearTokens();
    } finally {
      // Small delay to ensure overlay is visible
      await new Promise((resolve) => setTimeout(resolve, 300));
      isLoadingProfile.value = false;
    }
  }
});
