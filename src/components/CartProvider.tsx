"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DisplayUnit } from "@/lib/units";

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: DisplayUnit;
  baseUnit: string;
  basePricePerBaseUnit: number;
  dimension: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number, unit: DisplayUnit) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateItem: () => {},
  clearCart: () => {},
  itemCount: 0,
});

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === newItem.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + newItem.quantity, unit: newItem.unit }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateItem = useCallback((productId: string, quantity: number, unit: DisplayUnit) => {
    setItems(prev =>
      prev.map(i =>
        i.productId === productId ? { ...i, quantity, unit } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        clearCart,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
