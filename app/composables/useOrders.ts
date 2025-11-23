/**
 * Orders Composable
 * Handles all CRUD operations for packaging orders
 */

export interface Order {
  id: string;
  user_id: string;
  packaging_product_id: string;
  quantity: number;
  total_price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  packaging_product_id: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderData {
  packaging_product_id?: string;
  quantity?: number;
  status?: "pending" | "processing" | "completed" | "cancelled";
  notes?: string;
}

export const useOrders = () => {
  const supabase = useSupabase();
  const { $toast } = useNuxtApp();
  const { t } = useI18n();
  const userProfile = useState<any>("userProfile");
  const { logActivity } = useActivityLogs();

  /**
   * Get all orders (filtered by user if not admin)
   */
  const getAllOrders = async (options?: {
    status?: string;
    userId?: string;
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          user:user_id (
            id,
            name
          ),
          product:packaging_product_id (
            id,
            name,
            sku,
            unit,
            unit_price
          )
        `
        )
        .order("created_at", { ascending: false });

      // Filter by status
      if (options?.status) {
        query = query.eq("status", options.status);
      }

      // Filter by user (admin can see all, staff only see their own)
      if (options?.userId) {
        query = query.eq("user_id", options.userId);
      } else if (userProfile.value?.role !== "admin") {
        query = query.eq("user_id", userProfile.value?.id);
      }

      // Filter by date range
      if (options?.startDate) {
        query = query.gte("created_at", options.startDate);
      }
      if (options?.endDate) {
        query = query.lte("created_at", options.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Client-side search filter
      let filteredData = data || [];
      if (options?.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        filteredData = filteredData.filter(
          (order: any) =>
            order.product?.name.toLowerCase().includes(query) ||
            order.product?.sku.toLowerCase().includes(query) ||
            order.user?.name.toLowerCase().includes(query) ||
            order.notes?.toLowerCase().includes(query)
        );
      }

      return { success: true, data: filteredData };
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      $toast.error(t("orders.fetchError"));
      return { success: false, data: [], error: error.message };
    }
  };

  /**
   * Get a single order by ID
   */
  const getOrderById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:user_id (
            id,
            name,
            role
          ),
          product:packaging_product_id (
            id,
            name,
            description,
            sku,
            unit,
            unit_price,
            stock_quantity
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check permissions
      if (userProfile.value?.role !== "admin" && data.user_id !== userProfile.value?.id) {
        $toast.error(t("orders.accessDenied"));
        return { success: false, data: null, error: "Access denied" };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching order:", error);
      $toast.error(t("orders.fetchError"));
      return { success: false, data: null, error: error.message };
    }
  };

  /**
   * Create a new order
   */
  const createOrder = async (data: CreateOrderData) => {
    try {
      if (!userProfile.value?.id) {
        throw new Error("User not authenticated");
      }

      // Get product details to calculate price
      const { data: product, error: productError } = await supabase
        .from("packaging_products")
        .select("unit_price, stock_quantity")
        .eq("id", data.packaging_product_id)
        .single();

      if (productError) throw productError;

      // Check stock availability
      if (product.stock_quantity < data.quantity) {
        $toast.error(t("orders.insufficientStock"));
        return { success: false, error: "Insufficient stock" };
      }

      const total_price = product.unit_price * data.quantity;

      const { data: newOrder, error } = await supabase
        .from("orders")
        .insert({
          user_id: userProfile.value.id,
          packaging_product_id: data.packaging_product_id,
          quantity: data.quantity,
          total_price: total_price,
          notes: data.notes || null,
          status: "pending",
        })
        .select(
          `
          *,
          user:user_id (
            id,
            name
          ),
          product:packaging_product_id (
            id,
            name,
            sku,
            unit
          )
        `
        )
        .single();

      if (error) throw error;
      if (!newOrder) throw new Error("Order creation failed");

      // Log activity
      await logActivity({
        action: "create",
        entity_type: "order",
        entity_id: (newOrder as any).id,
        entity_name: (newOrder as any).product?.name || "Order",
        details: {
          quantity: (newOrder as any).quantity,
          total_price: (newOrder as any).total_price,
          product_id: data.packaging_product_id,
        },
      });

      $toast.success(t("orders.createSuccess"));
      return { success: true, data: newOrder };
    } catch (error: any) {
      console.error("Error creating order:", error);
      $toast.error(t("orders.createError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Update an order
   */
  const updateOrder = async (id: string, data: UpdateOrderData) => {
    try {
      // Get existing order to check permissions
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("user_id, status")
        .eq("id", id)
        .single();

      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Check permissions
      const isOwner = existingOrder.user_id === userProfile.value?.id;
      const isAdmin = userProfile.value?.role === "admin";

      if (!isOwner && !isAdmin) {
        $toast.error(t("orders.accessDenied"));
        return { success: false, error: "Access denied" };
      }

      // Staff can only update pending orders
      if (!isAdmin && existingOrder.status !== "pending") {
        $toast.error(t("orders.cannotEditCompleted"));
        return { success: false, error: "Cannot edit non-pending order" };
      }

      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Recalculate price if product or quantity changed
      if (data.packaging_product_id || data.quantity) {
        const productId = data.packaging_product_id || existingOrder.packaging_product_id;
        const { data: product } = await supabase
          .from("packaging_products")
          .select("unit_price")
          .eq("id", productId)
          .single();

        if (product) {
          const quantity = data.quantity || existingOrder.quantity;
          updateData.total_price = product.unit_price * quantity;
        }
      }

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select(
          `
          *,
          user:user_id (
            id,
            name
          ),
          product:packaging_product_id (
            id,
            name,
            sku,
            unit
          )
        `
        )
        .single();

      if (error) throw error;
      if (!updatedOrder) throw new Error("Order update failed");

      // Log activity
      await logActivity({
        action: "update",
        entity_type: "order",
        entity_id: (updatedOrder as any).id,
        entity_name: (updatedOrder as any).product?.name || "Order",
        details: {
          changes: data,
        },
      });

      $toast.success(t("orders.updateSuccess"));
      return { success: true, data: updatedOrder };
    } catch (error: any) {
      console.error("Error updating order:", error);
      $toast.error(t("orders.updateError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete an order (admin only)
   */
  const deleteOrder = async (id: string) => {
    try {
      if (userProfile.value?.role !== "admin") {
        $toast.error(t("orders.adminOnly"));
        return { success: false, error: "Admin access required" };
      }

      // Get order details before deleting
      const { data: order } = await supabase
        .from("orders")
        .select(`
          *,
          product:packaging_product_id (name)
        `)
        .eq("id", id)
        .single();

      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "delete",
        entity_type: "order",
        entity_id: id,
        entity_name: (order as any)?.product?.name || "Order",
      });

      $toast.success(t("orders.deleteSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting order:", error);
      $toast.error(t("orders.deleteError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Update order status
   */
  const updateOrderStatus = async (
    id: string,
    status: "pending" | "processing" | "completed" | "cancelled"
  ) => {
    try {
      // Get order details for logging
      const { data: order } = await supabase
        .from("orders")
        .select(`
          *,
          product:packaging_product_id (name)
        `)
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity({
        action: status === "cancelled" ? "cancel" : "status_change",
        entity_type: "order",
        entity_id: id,
        entity_name: (order as any)?.product?.name || "Order",
        details: {
          old_status: (order as any)?.status,
          new_status: status,
        },
      });

      $toast.success(t("orders.statusUpdated"));
      return { success: true, data };
    } catch (error: any) {
      console.error("Error updating order status:", error);
      $toast.error(t("orders.statusUpdateError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Cancel an order
   */
  const cancelOrder = async (id: string) => {
    return updateOrderStatus(id, "cancelled");
  };

  /**
   * Get order statistics
   */
  const getOrderStats = async () => {
    try {
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: completedOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      return {
        success: true,
        data: {
          total: totalOrders || 0,
          pending: pendingOrders || 0,
          completed: completedOrders || 0,
        },
      };
    } catch (error: any) {
      console.error("Error fetching order stats:", error);
      return { success: false, data: null, error: error.message };
    }
  };

  return {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
  };
};
