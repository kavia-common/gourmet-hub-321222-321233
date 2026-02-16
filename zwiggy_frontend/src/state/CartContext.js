import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function round2(n) {
  return Math.round(n * 100) / 100;
}

function computeTotals(items) {
  const subtotal = round2(items.reduce((sum, it) => sum + it.price * it.quantity, 0));
  const deliveryFee = round2(subtotal >= 20 ? 0 : 1.99);
  const tax = round2(subtotal * 0.07);
  const total = round2(subtotal + deliveryFee + tax);
  return { subtotal, deliveryFee, tax, total };
}

/**
 * PUBLIC_INTERFACE
 * CartProvider manages a single active cart tied to one restaurant at a time.
 */
export function CartProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null); // {id,name}
  const [items, setItems] = useState([]); // {id,name,price,quantity}

  const totals = useMemo(() => computeTotals(items), [items]);

  const value = useMemo(() => {
    return {
      restaurant,
      items,
      totals,
      itemCount: items.reduce((sum, it) => sum + it.quantity, 0),

      // PUBLIC_INTERFACE
      startCartForRestaurant(nextRestaurant) {
        // If switching restaurants, clear cart (typical food ordering behavior).
        if (restaurant && nextRestaurant && restaurant.id !== nextRestaurant.id) {
          setItems([]);
        }
        setRestaurant(nextRestaurant);
      },

      // PUBLIC_INTERFACE
      addItem(menuItem, restaurantInfo) {
        if (restaurantInfo) {
          if (!restaurant || restaurant.id !== restaurantInfo.id) {
            setRestaurant({ id: restaurantInfo.id, name: restaurantInfo.name });
            setItems([]);
          }
        }
        setItems((prev) => {
          const idx = prev.findIndex((x) => x.id === menuItem.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
            return next;
          }
          return [...prev, { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
        });
      },

      // PUBLIC_INTERFACE
      removeItem(itemId) {
        setItems((prev) => prev.filter((x) => x.id !== itemId));
      },

      // PUBLIC_INTERFACE
      setQuantity(itemId, quantity) {
        const q = Math.max(0, Number(quantity) || 0);
        setItems((prev) => {
          if (q === 0) return prev.filter((x) => x.id !== itemId);
          return prev.map((x) => (x.id === itemId ? { ...x, quantity: q } : x));
        });
      },

      // PUBLIC_INTERFACE
      clearCart() {
        setItems([]);
        setRestaurant(null);
      }
    };
  }, [items, restaurant, totals]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Hook to access cart state.
 */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
