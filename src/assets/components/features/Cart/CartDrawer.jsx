// ============================================================
//  TAKEO PERFUMARIA — components/CartDrawer.jsx
//  Painel lateral: lista do carrinho → abre CheckoutFlow
// ============================================================
import { useEffect, useRef, useState } from "react";
import { fmt } from "../../../../utils/formatters.js";
import { Icons } from "../../Icons.jsx";
import ProductImage from "../../ProductImage.jsx";
import CheckoutFlow from "../Checkout/CheckoutFlow.jsx";
import CartLineItem from "./components/CartLineItem.jsx";

export default function CartDrawer({ cart, onClose }) {
  const [mode, setMode] = useState("cart"); // "cart" | "checkout"
  const drawerRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Fechar no overlay
  const handleOverlay = (e) => {
    if (!drawerRef.current?.contains(e.target)) onClose();
  };

  const isCart = mode === "cart";

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleOverlay}
        style={{
          position:       "fixed",
          inset:          0,
          background:     "rgba(17,7,40,.55)",
          backdropFilter: "blur(4px)",
          zIndex:         400,
          animation:      "fadeIn var(--duration-base) var(--ease-out)",
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position:      "fixed",
          top:           0,
          right:         0,
          bottom:        0,
          width:         "min(440px, 100vw)",
          background:    "var(--surface)",
          zIndex:        500,
          display:       "flex",
          flexDirection: "column",
          boxShadow:     "var(--shadow-xl)",
          animation:     "slideInRight var(--duration-slow) var(--ease-out)",
        }}
      >
        {/* Header do drawer */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "var(--space-5) var(--space-6)",
          background:     "linear-gradient(135deg, var(--purple-deep), var(--purple-main))",
          color:          "#fff",
          flexShrink:     0,
        }}>
          <div>
            {isCart ? (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>
                  🛒 Meu Carrinho
                </h2>
                {cart.totalItems > 0 && (
                  <p style={{ fontSize: ".78rem", color: "var(--lilac-soft)", marginTop: 2 }}>
                    {cart.totalItems} {cart.totalItems === 1 ? "item" : "itens"} · {fmt(cart.totalPrice)}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>
                  📋 Finalizar Pedido
                </h2>
                <p style={{ fontSize: ".78rem", color: "var(--lilac-soft)", marginTop: 2 }}>
                  {fmt(cart.totalPrice)} · {cart.totalItems} {cart.totalItems === 1 ? "item" : "itens"}
                </p>
              </>
            )}
          </div>
          <button
            onClick={isCart ? onClose : () => setMode("cart")}
            style={{
              color:        "rgba(255,255,255,.7)",
              padding:      "var(--space-2)",
              borderRadius: "var(--radius-full)",
              background:   "rgba(255,255,255,.1)",
              display:      "flex",
            }}
          >
            {isCart ? <Icons.X size={20} /> : <Icons.ChevronLeft size={20} />}
          </button>
        </div>

        {/* ── Modo Carrinho ─────────────────────────── */}
        {isCart && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 var(--space-6)" }}>
              {cart.items.length === 0 ? (
                <div style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  height:         "100%",
                  gap:            "var(--space-4)",
                  color:          "var(--text-muted)",
                  textAlign:      "center",
                }}>
                  <div style={{ animation: "float 3s ease-in-out infinite" }}>
                    <Icons.Perfume size={72} />
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--purple-deep)" }}>
                    Seu carrinho está vazio
                  </p>
                  <p style={{ fontSize: ".83rem" }}>
                    Explore nossa coleção e adicione produtos
                  </p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onRemove={cart.remove}
                    onQty={cart.updateQty}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div style={{
                padding:       "var(--space-5) var(--space-6)",
                borderTop:     "1px solid var(--border)",
                flexShrink:    0,
                display:       "flex",
                flexDirection: "column",
                gap:           "var(--space-3)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: "var(--purple-deep)" }}>
                    {fmt(cart.totalPrice)}
                  </span>
                </div>
                <button
                  onClick={() => setMode("checkout")}
                  style={{
                    padding:        "var(--space-4)",
                    background:     "linear-gradient(135deg, var(--purple-main), var(--purple-mid))",
                    color:          "#fff",
                    fontWeight:     700,
                    fontSize:       "1rem",
                    borderRadius:   "var(--radius-xl)",
                    border:         "none",
                    cursor:         "pointer",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            "var(--space-2)",
                    boxShadow:      "0 4px 18px rgba(109,40,217,.4)",
                  }}
                >
                  Avançar para Checkout <Icons.ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Modo Checkout (3 etapas) ─────────────── */}
        {!isCart && (
          <CheckoutFlow cart={cart} onClose={onClose} />
        )}
      </div>
    </>
  );
}