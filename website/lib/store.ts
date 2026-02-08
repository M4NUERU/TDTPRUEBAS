import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string; // e.g., "Tela Anti-fluidos"
    color: string; // e.g., "Azul Navy"
    image?: string;
    quantity: number;
    price: number; // Unit price
}

export type Brand = 'TODOTEJIDOS' | 'EMADERA';

interface CartState {
    cart: CartItem[];
    isCartOpen: boolean;
    activeBrand: Brand;
    setActiveBrand: (brand: Brand) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string, itemColor: string) => void;
    updateQuantity: (itemId: string, itemColor: string, delta: number) => void;
    toggleCart: () => void;
    clearCart: () => void;
    cartTotal: () => number;
}

export const useStore = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            isCartOpen: false,
            activeBrand: 'TODOTEJIDOS',

            setActiveBrand: (brand) => set({ activeBrand: brand }),

            addToCart: (newItem) => set((state) => {
                const existingIndex = state.cart.findIndex(
                    item => item.id === newItem.id && item.color === newItem.color
                );

                if (existingIndex > -1) {
                    // Update quantity if exists
                    const newCart = [...state.cart];
                    newCart[existingIndex].quantity += newItem.quantity;
                    return { cart: newCart, isCartOpen: true };
                }

                return { cart: [...state.cart, newItem], isCartOpen: true };
            }),

            removeFromCart: (itemId, itemColor) => set((state) => ({
                cart: state.cart.filter(item => !(item.id === itemId && item.color === itemColor))
            })),

            updateQuantity: (itemId, itemColor, delta) => set((state) => {
                const newCart = state.cart.map(item => {
                    if (item.id === itemId && item.color === itemColor) {
                        const newQty = Math.max(1, item.quantity + delta);
                        return { ...item, quantity: newQty };
                    }
                    return item;
                });
                return { cart: newCart };
            }),

            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

            clearCart: () => set({ cart: [] }),

            cartTotal: () => {
                const { cart } = get();
                return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            }
        }),
        {
            name: 'todotejidos-cart-storage', // unique name
        }
    )
);
