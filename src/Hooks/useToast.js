import { useState, useCallback } from "react";
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return { toasts, show };
}