import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';

export interface CartItem {
  product_type: string;
  id: number;
  ref: string;
  category: string;
  name: string;
  price: number;
  size: string | number;
  image: string;
  promo: number;
  quantity: number;
  maxQuantity: number
}

export interface CartContextType {
  allItems: CartItem[];
  itemCount: number;
  cartTotalAmount: number;
  cartChecker: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (item: CartItem) => void;
  clearCart: () => void;
  handlePlusQuantity: (item: CartItem) => void;
  handleMinusQuantity: (item: CartItem) => void;
  successTransItems: CartItem[];
  setSuccessTransItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'AL-Firdaous-All-Items';
const SUCCESS_KEY = 'AL-Firdaous-Success-All-Items';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // 🔹 récupérer depuis localStorage
  const [allItems, setAllItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [successTransItems, setSuccessTransItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(SUCCESS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 🔹 sync localStorage (UNE SEULE SOURCE DE VÉRITÉ)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allItems));
  }, [allItems]);

  useEffect(() => {
    localStorage.setItem(SUCCESS_KEY, JSON.stringify(successTransItems));
  }, [successTransItems]);

  // // 🔹 helpers
  // function quantityFilter(products: Product[], id: number, size: string | number): number {
  //   const product = products.find((p) => p.id === id);
  //   if (!product) return 0;

  //   const stockItem = product.stock.find((s) => s.size === size);
  //   if (!stockItem) return 0;

  //   return stockItem.quantity;
  // }

  // 🔹 actions
  const addItem = (item: CartItem) => {
    setAllItems((prev) => {
      // vérifier si item déjà existe (id + size)
      const existing = prev.find(
        (i) => i.id === item.id && i.size === item.size
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });
  };

  const removeItem = (item: CartItem) => {
    setAllItems((prev) =>
      prev.filter((i) => !(i.id === item.id && i.size === item.size))
    );
  };

  const clearCart = () => {
    setAllItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handlePlusQuantity = (item: CartItem) => {
    setAllItems((prev) =>
      prev.map((i) =>
        i.id === item.id && i.size === item.size
          ? i.quantity < item.maxQuantity
            ? { ...i, quantity: i.quantity + 1 }
            : i
          : i
      )
    );
  };

  const handleMinusQuantity = (item: CartItem) => {
    setAllItems((prev) =>
      prev.map((i) =>
        i.id === item.id && i.size === item.size && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      )
    );
  };

  // 🔹 computed
  const itemCount = useMemo(() =>{
    let count = 0;
    allItems.forEach((i)=>{
      count += i.quantity
    });
    return count
  }, [allItems]);

  const cartChecker = useMemo(() => itemCount > 0, [itemCount]);

  const cartTotalAmount = useMemo(() => {
    const total = allItems.reduce(
      (sum, item) =>
        sum + item.price * (1 - item.promo*0.01) * item.quantity,
      0
    );
    return Math.round(total*100)/100
  }, [allItems]);

  return (
    <CartContext.Provider
      value={{
        allItems,
        itemCount,
        cartTotalAmount,
        cartChecker,
        successTransItems,
        setSuccessTransItems,
        addItem,
        removeItem,
        clearCart,
        handleMinusQuantity,
        handlePlusQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 🔹 hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};