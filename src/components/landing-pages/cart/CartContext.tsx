"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CartProduct {
  id: string;
  title: string;
  price: string;           // chuỗi hiển thị, vd "390.000đ"
  priceNum: number;        // số để tính tổng
  oldPrice?: string;
  image?: string;
  badge?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; product: CartProduct }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "UPDATE_QTY"; id: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "OPEN_CHECKOUT" }
  | { type: "CLOSE_CHECKOUT" };

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Chuyển chuỗi giá "390.000đ" hoặc "$49" thành số */
export function parsePriceNum(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          isDrawerOpen: true,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        ...state,
        isDrawerOpen: true,
        items: [...state.items, { ...action.product, quantity: 1 }],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [], isDrawerOpen: false, isCheckoutOpen: false };
    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };
    case "OPEN_CHECKOUT":
      return { ...state, isDrawerOpen: false, isCheckoutOpen: true };
    case "CLOSE_CHECKOUT":
      return { ...state, isCheckoutOpen: false };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  isCheckoutOpen: boolean;
  totalItems: number;
  totalAmount: number;
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = {
  items: [],
  isDrawerOpen: false,
  isCheckoutOpen: false,
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = state.items.reduce((sum, i) => sum + i.priceNum * i.quantity, 0);

  const addToCart = useCallback((product: CartProduct) => dispatch({ type: "ADD_ITEM", product }), []);
  const removeFromCart = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", id }), []);
  const updateQuantity = useCallback((id: string, quantity: number) => dispatch({ type: "UPDATE_QTY", id, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openDrawer = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(() => dispatch({ type: "CLOSE_DRAWER" }), []);
  const openCheckout = useCallback(() => dispatch({ type: "OPEN_CHECKOUT" }), []);
  const closeCheckout = useCallback(() => dispatch({ type: "CLOSE_CHECKOUT" }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        isCheckoutOpen: state.isCheckoutOpen,
        totalItems,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openDrawer,
        closeDrawer,
        openCheckout,
        closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
