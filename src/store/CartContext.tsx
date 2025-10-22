/**
 * Cart Context Provider / Səbət Context Provayderi
 * This context manages shopping cart state globally
 * Bu context alış-veriş səbəti vəziyyətini qlobal olaraq idarə edir
 */

"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

// Cart Item Interface / Səbət Elementi İnterfeysi
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string;
    stock: number;
    seller?: {
      name: string;
    };
  };
}

// Cart State Interface / Səbət Vəziyyəti İnterfeysi
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

// Cart Action Types / Səbət Əməliyyat Növləri
type CartAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" };

// Cart Context Interface / Səbət Context İnterfeysi
interface CartContextType {
  state: CartState;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

// Initial State / İlkin Vəziyyət
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

// Cart Reducer / Səbət Reducer-i
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_CART":
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      return {
        ...state,
        items,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };

    case "ADD_ITEM":
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
        error: null,
      };

    case "UPDATE_QUANTITY":
      const updatedItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const updatedTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const updatedTotalPrice = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedTotalItems,
        totalPrice: updatedTotalPrice,
        error: null,
      };

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter(item => item.productId !== action.payload);
      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      const filteredTotalPrice = filteredItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredTotalItems,
        totalPrice: filteredTotalPrice,
        error: null,
      };

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        error: null,
      };

    default:
      return state;
  }
}

// Create Context / Context Yarat
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component / Səbət Provayder Komponenti
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Fetch cart from API / API-dən səbəti əldə et
  const fetchCart = async () => {
    if (!isAuthenticated || !user) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (data.success) {
        dispatch({ type: "SET_CART", payload: data.data });
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch cart / Səbəti əldə etmək uğursuz" });
    }
  };

  // Add item to cart / Səbətə element əlavə et
  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      dispatch({ type: "SET_ERROR", payload: "Please sign in to add items to cart / Səbətə element əlavə etmək üçün giriş edin" });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      // First, get product details / Əvvəlcə məhsul təfərrüatlarını əldə et
      const productResponse = await fetch(`/api/products/${productId}`);
      const productData = await productResponse.json();

      if (!productData.success) {
        dispatch({ type: "SET_ERROR", payload: "Product not found / Məhsul tapılmadı" });
        return;
      }

      const product = productData.data;

      // Add to cart via API / API vasitəsilə səbətə əlavə et
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const cartItem: CartItem = {
          id: data.data.id,
          productId,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            stock: product.stock,
            seller: product.seller,
          },
        };
        dispatch({ type: "ADD_ITEM", payload: cartItem });
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to add item to cart / Səbətə element əlavə etmək uğursuz" });
    }
  };

  // Update item quantity / Element miqdarını yenilə
  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update quantity / Miqdarı yeniləmək uğursuz" });
    }
  };

  // Remove item from cart / Səbətdən element çıxar
  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: "REMOVE_ITEM", payload: productId });
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to remove item / Elementi çıxarmaq uğursuz" });
    }
  };

  // Clear cart / Səbəti təmizlə
  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        dispatch({ type: "CLEAR_CART" });
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to clear cart / Səbəti təmizləmək uğursuz" });
    }
  };

  // Get item quantity / Element miqdarını əldə et
  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  // Check if item is in cart / Elementin səbətdə olub-olmadığını yoxla
  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.productId === productId);
  };

  // Load cart when user authenticates / İstifadəçi autentifikasiya olduqda səbəti yüklə
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    } else {
      dispatch({ type: "CLEAR_CART" });
    }
  }, [isAuthenticated, user]);

  const value: CartContextType = {
    state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context / Səbət context istifadə etmək üçün custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider / useCart CartProvider içində istifadə edilməlidir");
  }
  return context;
}
