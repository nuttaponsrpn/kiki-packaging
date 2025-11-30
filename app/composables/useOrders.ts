/**
 * Orders Composable
 * Handles all CRUD operations for packaging orders
 */

export interface OrderItem {
  id: string;
  packaging_product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: {
    name: string;
    unit: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  payment_method: "cash" | "transfer" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user?: {
    name: string;
  };
}

export interface CreateOrderItemData {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  items: CreateOrderItemData[];
  paymentMethod: "cash" | "transfer";
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
          items:order_items (
            id,
            quantity,
            unit_price,
            total_price,
            product:packaging_product_id (
              name,
              unit
            )
          ),
          legacy_product:packaging_product_id (
            name,
            unit
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
            order.user?.name.toLowerCase().includes(query) ||
            order.notes?.toLowerCase().includes(query) ||
            order.items?.some((item: any) => item.product?.name.toLowerCase().includes(query))
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
          items:order_items (
            id,
            quantity,
            unit_price,
            total_price,
            product:packaging_product_id (
              id,
              name,
              description,
              sku,
              unit,
              unit_price,
              image_url
            )
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

      // Calculate total price
      const totalPrice = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

      // 1. Create Order
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userProfile.value.id,
          total_price: totalPrice,
          payment_method: data.paymentMethod,
          notes: data.notes || null,
          status: "processing",
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!newOrder) throw new Error("Order creation failed");

      // 2. Create Order Items
      const orderItems = data.items.map((item) => ({
        order_id: newOrder.id,
        packaging_product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.quantity * item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Update Stock (Client-side for now, ideally server-side or RPC)
      for (const item of data.items) {
        // Fetch current stock first to ensure atomic-like update (simplified)
        const { data: product } = await supabase
          .from("packaging_products")
          .select("stock_quantity")
          .eq("id", item.productId)
          .single();

        if (product) {
          await supabase
            .from("packaging_products")
            .update({ stock_quantity: product.stock_quantity - item.quantity })
            .eq("id", item.productId);
        }
      }

      // Log activity
      await logActivity({
        action: "create",
        entity_type: "order",
        entity_id: newOrder.id,
        entity_name: `Order #${newOrder.id.slice(0, 8)}`,
        details: {
          items_count: data.items.length,
          total_price: totalPrice,
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
   * Restore stock for an order
   */
  const restoreStock = async (orderId: string) => {
    try {
      // Get order items
      const { data: items, error } = await supabase
        .from("order_items")
        .select("packaging_product_id, quantity")
        .eq("order_id", orderId);

      if (error) throw error;
      if (!items) return;

      // Restore stock for each item
      for (const item of items) {
        // Fetch current stock
        const { data: product } = await supabase
          .from("packaging_products")
          .select("stock_quantity")
          .eq("id", item.packaging_product_id)
          .single();

        if (product) {
          await supabase
            .from("packaging_products")
            .update({ stock_quantity: product.stock_quantity + item.quantity })
            .eq("id", item.packaging_product_id);
        }
      }
    } catch (error) {
      console.error("Error restoring stock:", error);
      throw error;
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

      // Check order status before deleting
      const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", id)
        .single();

      // If order is pending or processing, restore stock before deleting
      if (order && (order.status === "pending" || order.status === "processing")) {
        await restoreStock(id);
      }

      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "delete",
        entity_type: "order",
        entity_id: id,
        entity_name: `Order #${id.slice(0, 8)}`,
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
        entity_name: `Order #${id.slice(0, 8)}`,
        details: {
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
   * Delete an order item
   */
  const deleteOrderItem = async (orderId: string, itemId: string) => {
    try {
      // 1. Get the item and order details
      const { data: item, error: itemError } = await supabase
        .from("order_items")
        .select("quantity, total_price, packaging_product_id")
        .eq("id", itemId)
        .single();

      if (itemError) throw itemError;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("status, total_price")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      // 2. Restore stock if order is pending or processing
      if (order.status === "pending" || order.status === "processing") {
        const { data: product } = await supabase
          .from("packaging_products")
          .select("stock_quantity")
          .eq("id", item.packaging_product_id)
          .single();

        if (product) {
          await supabase
            .from("packaging_products")
            .update({ stock_quantity: product.stock_quantity + item.quantity })
            .eq("id", item.packaging_product_id);
        }
      }

      // 3. Delete the item
      const { error: deleteError } = await supabase
        .from("order_items")
        .delete()
        .eq("id", itemId);

      if (deleteError) throw deleteError;

      // 4. Update order total price
      const newTotal = Math.max(0, order.total_price - item.total_price);
      const { error: updateError } = await supabase
        .from("orders")
        .update({ total_price: newTotal })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Log activity
      await logActivity({
        action: "delete_item",
        entity_type: "order",
        entity_id: orderId,
        entity_name: `Order #${orderId.slice(0, 8)}`,
        details: {
          item_id: itemId,
          restored_stock: order.status === "pending" || order.status === "processing",
        },
      });

      $toast.success(t("orders.itemDeleteSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting order item:", error);
      $toast.error(t("orders.itemDeleteError"));
      return { success: false, error: error.message };
    }
  };

  return {
    getAllOrders,
    getOrderById,
    createOrder,
    deleteOrder,
    deleteOrderItem,
    updateOrderStatus,
  };
};
