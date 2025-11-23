/**
 * Global Authentication Middleware
 * Protects routes that require authentication
 */

export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check on server side
  if (import.meta.server) return;

  const auth = useAuth();
  const isLoadingProfile = useState<boolean>("isLoadingProfile");

  // Wait for profile loading to complete
  if (isLoadingProfile.value) {
    return;
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/accept-invitation"];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) => to.path.startsWith(route));

  // If trying to access protected route without authentication
  if (!isPublicRoute && !auth.isAuthenticated()) {
    return navigateTo("/login");
  }

  // If trying to access login while authenticated
  if (to.path === "/login" && auth.isAuthenticated()) {
    return navigateTo("/dashboard");
  }
});
