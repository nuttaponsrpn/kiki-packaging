/**
 * Packaging Products Composable
 * Handles all CRUD operations for packaging products
 */

export interface PackagingProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  unit: string;
  unit_price: number;
  stock_quantity: number;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePackagingData {
  name: string;
  description?: string;
  sku: string;
  unit: string;
  unit_price: number;
  stock_quantity: number;
  image_url?: string;
  category?: string;
  is_active?: boolean;
}

export interface UpdatePackagingData {
  name?: string;
  description?: string;
  sku?: string;
  unit?: string;
  unit_price?: number;
  stock_quantity?: number;
  image_url?: string;
  category?: string;
  is_active?: boolean;
}

export const usePackaging = () => {
  const supabase = useSupabase();
  const { $toast } = useNuxtApp();
  const { t } = useI18n();
  const { logActivity } = useActivityLogs();

  /**
   * Get all packaging products
   */
  const getAllPackaging = async (options?: {
    activeOnly?: boolean;
    searchQuery?: string;
    category?: string;
  }) => {
    try {
      let query = supabase
        .from("packaging_products")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by active status
      if (options?.activeOnly) {
        query = query.eq("is_active", true);
      }

      // Search by name or SKU
      if (options?.searchQuery) {
        query = query.or(`name.ilike.%${options.searchQuery}%,sku.ilike.%${options.searchQuery}%`);
      }

      // Filter by category
      if (options?.category) {
        query = query.eq("category", options.category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Error fetching packaging products:", error);
      $toast.error(t("packaging.fetchError"));
      return { success: false, data: [], error: error.message };
    }
  };

  /**
   * Get a single packaging product by ID
   */
  const getPackagingById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("packaging_products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error("Error fetching packaging product:", error);
      $toast.error(t("packaging.fetchError"));
      return { success: false, data: null, error: error.message };
    }
  };

  /**
   * Create a new packaging product
   */
  const createPackaging = async (data: CreatePackagingData) => {
    try {
      // Check if SKU already exists
      const { data: existing } = await supabase
        .from("packaging_products")
        .select("id")
        .eq("sku", data.sku)
        .maybeSingle();

      if (existing) {
        $toast.error(t("packaging.skuExists"));
        return { success: false, error: "SKU already exists" };
      }

      const { data: newProduct, error } = await supabase
        .from("packaging_products")
        .insert({
          name: data.name,
          description: data.description || null,
          sku: data.sku,
          unit: data.unit,
          unit_price: data.unit_price,
          stock_quantity: data.stock_quantity,
          image_url: data.image_url || null,
          category: data.category || null,
          is_active: data.is_active !== undefined ? data.is_active : true,
        })
        .select()
        .single();

      if (error) throw error;
      if (!newProduct) throw new Error("Product creation failed");

      // Log activity
      await logActivity({
        action: "create",
        entity_type: "packaging",
        entity_id: newProduct.id,
        entity_name: newProduct.name,
        details: {
          sku: newProduct.sku,
          unit_price: newProduct.unit_price,
          stock_quantity: newProduct.stock_quantity,
        },
      });

      $toast.success(t("packaging.createSuccess"));
      return { success: true, data: newProduct };
    } catch (error: any) {
      console.error("Error creating packaging product:", error);
      $toast.error(t("packaging.createError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Update a packaging product
   */
  const updatePackaging = async (id: string, data: UpdatePackagingData) => {
    try {
      // If SKU is being updated, check if it already exists
      if (data.sku) {
        const { data: existing } = await supabase
          .from("packaging_products")
          .select("id")
          .eq("sku", data.sku)
          .neq("id", id)
          .maybeSingle();

        if (existing) {
          $toast.error(t("packaging.skuExists"));
          return { success: false, error: "SKU already exists" };
        }
      }

      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedProduct, error } = await supabase
        .from("packaging_products")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!updatedProduct) throw new Error("Product update failed");

      // Log activity
      await logActivity({
        action: "update",
        entity_type: "packaging",
        entity_id: (updatedProduct as PackagingProduct).id,
        entity_name: (updatedProduct as PackagingProduct).name,
        details: {
          changes: data,
        },
      });

      $toast.success(t("packaging.updateSuccess"));
      return { success: true, data: updatedProduct };
    } catch (error: any) {
      console.error("Error updating packaging product:", error);
      $toast.error(t("packaging.updateError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete a packaging product (soft delete - set is_active to false)
   */
  const deletePackaging = async (id: string) => {
    try {
      // Get product name before deleting
      const { data: product } = await supabase
        .from("packaging_products")
        .select("name")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("packaging_products")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "delete",
        entity_type: "packaging",
        entity_id: id,
        entity_name: (product as any)?.name || "Unknown Product",
      });

      $toast.success(t("packaging.deleteSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting packaging product:", error);
      $toast.error(t("packaging.deleteError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Permanently delete a packaging product (hard delete)
   */
  const permanentlyDeletePackaging = async (id: string) => {
    try {
      const { error } = await supabase.from("packaging_products").delete().eq("id", id);

      if (error) throw error;

      $toast.success(t("packaging.deleteSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error permanently deleting packaging product:", error);
      $toast.error(t("packaging.deleteError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Reactivate a deactivated packaging product
   */
  const reactivatePackaging = async (id: string) => {
    try {
      // Get product name before reactivating
      const { data: product } = await supabase
        .from("packaging_products")
        .select("name")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("packaging_products")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await logActivity({
        action: "reactivate",
        entity_type: "packaging",
        entity_id: id,
        entity_name: (product as any)?.name || "Unknown Product",
      });

      $toast.success(t("packaging.reactivateSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error reactivating packaging product:", error);
      $toast.error(t("packaging.reactivateError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Get all unique categories
   */
  const getCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("packaging_products")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;

      const categories = [...new Set(data.map((item: any) => item.category))].filter(Boolean);
      return { success: true, data: categories };
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      return { success: false, data: [], error: error.message };
    }
  };

  /**
   * Get low stock products (stock < threshold)
   */
  const getLowStockProducts = async (threshold: number = 10) => {
    try {
      const { data, error } = await supabase
        .from("packaging_products")
        .select("*")
        .eq("is_active", true)
        .lt("stock_quantity", threshold)
        .order("stock_quantity", { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error("Error fetching low stock products:", error);
      return { success: false, data: [], error: error.message };
    }
  };

  /**
   * Adjust stock quantity
   */
  const adjustStock = async (id: string, adjustment: number) => {
    try {
      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from("packaging_products")
        .select("stock_quantity")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const newQuantity = (product?.stock_quantity || 0) + adjustment;

      if (newQuantity < 0) {
        $toast.error(t("packaging.insufficientStock"));
        return { success: false, error: "Insufficient stock" };
      }

      const { error } = await supabase
        .from("packaging_products")
        .update({
          stock_quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      $toast.success(t("packaging.stockAdjusted"));
      return { success: true };
    } catch (error: any) {
      console.error("Error adjusting stock:", error);
      $toast.error(t("packaging.stockAdjustError"));
      return { success: false, error: error.message };
    }
  };

  return {
    getAllPackaging,
    getPackagingById,
    createPackaging,
    updatePackaging,
    deletePackaging,
    permanentlyDeletePackaging,
    reactivatePackaging,
    getCategories,
    getLowStockProducts,
    adjustStock,
  };
};
