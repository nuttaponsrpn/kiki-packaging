/**
 * Dashboard Composable
 * Handles dashboard metrics and recent activity
 */

export interface DashboardMetrics {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
}

export const useDashboard = () => {
  const supabase = useSupabase();
  const { $toast } = useNuxtApp();
  const { t } = useI18n();

  /**
   * Get dashboard metrics
   */
  const getMetrics = async (): Promise<{ success: boolean; data?: DashboardMetrics; error?: string }> => {
    try {
      // Get total orders count
      const { count: totalOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (ordersError) throw ordersError;

      // Get total products count (active only)
      const { count: totalProducts, error: productsError } = await supabase
        .from("packaging_products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (productsError) throw productsError;

      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (usersError) throw usersError;

      // Get pending orders count
      const { count: pendingOrders, error: pendingError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      return {
        success: true,
        data: {
          totalOrders: totalOrders || 0,
          totalProducts: totalProducts || 0,
          totalUsers: totalUsers || 0,
          pendingOrders: pendingOrders || 0,
        },
      };
    } catch (error: any) {
      console.error("Error fetching dashboard metrics:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Get recent activity (latest orders)
   */
  const getRecentActivity = async (limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:user_id (
            id,
            name
          ),
          items:order_items (
            id,
            quantity,
            product:packaging_product_id (
              id,
              name
            )
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Error fetching recent activity:", error);
      return { success: false, data: [], error: error.message };
    }
  };

  /**
   * Get low stock products (stock < threshold)
   */
  const getLowStockAlerts = async (threshold: number = 10) => {
    try {
      const { data, error } = await supabase
        .from("packaging_products")
        .select("*")
        .eq("is_active", true)
        .lt("stock_quantity", threshold)
        .order("stock_quantity", { ascending: true })
        .limit(5);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Error fetching low stock alerts:", error);
      return { success: false, data: [], error: error.message };
    }
  };

  /**
   * Get orders by status for charts
   */
  const getOrdersByStatus = async () => {
    try {
      const statuses = ["pending", "processing", "completed", "cancelled"];
      const results: any = {};

      for (const status of statuses) {
        const { count, error } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", status);

        if (error) throw error;
        results[status] = count || 0;
      }

      return { success: true, data: results };
    } catch (error: any) {
      console.error("Error fetching orders by status:", error);
      return { success: false, data: {}, error: error.message };
    }
  };

  /**
   * Get top ordered products
   */
  const getTopProducts = async (limit: number = 5) => {
    try {
      // This query groups orders by product and sums quantities
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          quantity,
          packaging_product_id,
          product:packaging_product_id (
            id,
            name
          )
        `
        )
        .order("quantity", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Aggregate by product
      const productMap = new Map();

      data?.forEach((order: any) => {
        const productId = order.packaging_product_id;
        const productName = order.product?.name || "Unknown";

        if (productMap.has(productId)) {
          productMap.get(productId).totalQuantity += order.quantity;
        } else {
          productMap.set(productId, {
            id: productId,
            name: productName,
            totalQuantity: order.quantity,
          });
        }
      });

      // Convert to array and sort
      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);

      return { success: true, data: topProducts };
    } catch (error: any) {
      console.error("Error fetching top products:", error);
      return { success: false, data: [], error: error.message };
    }
  };

  return {
    getMetrics,
    getRecentActivity,
    getLowStockAlerts,
    getOrdersByStatus,
    getTopProducts,
  };
};
