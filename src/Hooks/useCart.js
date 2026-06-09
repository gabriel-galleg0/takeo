import { useState, useCallback } from "react";

export function useCart() {
  const [items, setItems] = useState([]);

  const add = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) {
        const next = Math.min(found.qty + qty, product.estoque);
        return prev.map((i) => (i.id === product.id ? { ...i, qty: next } : i));
      }
      return [...prev, { ...product, qty: Math.min(qty, product.estoque) }];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty, maxStock) => {
    if (qty < 1) { remove(id); return; }
    const capped = Math.min(qty, maxStock);
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: capped } : i))
    );
  }, [remove]);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + (i.preco_promo ?? i.preco) * i.qty, 0);

  return { items, add, remove, updateQty, clear, totalItems, totalPrice };
}


