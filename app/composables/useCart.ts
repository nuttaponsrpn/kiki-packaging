/**
 * Cart Composable
 * Manages the shopping cart state for the POS system
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  unit: string;
}

export const useCart = () => {
  const items = useState<CartItem[]>("cartItems", () => []);
  const { $toast } = useNuxtApp();
  const { t } = useI18n();

  /**
   * Add item to cart
   */
  const addToCart = (product: any) => {
    const existingItem = items.value.find((item) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.unit_price,
        quantity: 1,
        sku: product.sku,
        unit: product.unit,
      });
    }
    $toast.success(t("cart.added"));
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId: string) => {
    const index = items.value.findIndex((item) => item.productId === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
    }
  };

  /**
   * Update item quantity
   */
  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find((item) => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    items.value = [];
  };

  /**
   * Calculate total price
   */
  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  /**
   * Calculate total items count
   */
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    totalItems,
  };
};
