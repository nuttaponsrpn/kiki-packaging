/**
 * Global Authentication Middleware
 * Protects routes that require authentication
 */

export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check on server side
  if (import.meta.server) return;

  const auth = useAuth();

  // Public routes that don't require authentication
  const publicRoutes = ["/login"];

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
