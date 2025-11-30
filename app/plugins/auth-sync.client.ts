export default defineNuxtPlugin(() => {
  const supabase = useSupabase();
  const auth = useAuth();
  const router = useRouter();

  supabase.auth.onAuthStateChange(async (event, session) => {
    // console.log("Auth state change:", event, session);

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      if (session) {
        // Update local tokens
        auth.saveTokens({
          access_token: session.access_token,
          access_token_expires_at: new Date(session.expires_at! * 1000).toISOString(),
          refresh_token: session.refresh_token,
          // Extend refresh token expiration to 7 days from now to match login logic
          refresh_token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          token_type: session.token_type,
        });
      }
    } else if (event === "SIGNED_OUT") {
      auth.clearTokens();
      // Redirect to login if not already there
      if (router.currentRoute.value.path !== "/login") {
        await router.push("/login");
      }
    }
  });
});
