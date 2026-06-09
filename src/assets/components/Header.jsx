// ============================================================
//  TAKEO PERFUMARIA — components/Header.jsx
// ============================================================
import { useState, useEffect } from "react";
import { CONFIG } from "../../utils/formatters.js";
import { Icons } from "./Icons.jsx";

export default function Header({ cartCount, onCartOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header style={{
      position:      "sticky",
      top:           0,
      zIndex:        200,
      height:        "var(--header-h)",
      background:    scrolled
        ? "rgba(46,16,101,.97)"
        : "linear-gradient(135deg, var(--purple-deep), var(--purple-main))",
      backdropFilter: "blur(14px)",
      boxShadow:     scrolled ? "var(--shadow-lg)" : "none",
      transition:    "background var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out)",
      display:       "flex",
      alignItems:    "center",
      padding:       "0 var(--space-5)",
    }}>
      <div style={{
        width:          "100%",
        maxWidth:       "var(--max-w)",
        margin:         "0 auto",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{
            width:      40,
            height:     40,
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, var(--lilac), var(--purple-mid))",
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize:   "1.3rem",
            boxShadow:  "0 2px 10px rgba(167,139,250,.45)",
          }}>
            🌸
          </div>
          <div>
            <h1 style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "1.35rem",
              fontWeight:    700,
              color:         "#fff",
              letterSpacing: ".02em",
              lineHeight:    1.1,
            }}>
              {CONFIG.STORE_NAME}
            </h1>
            <p style={{ fontSize: ".62rem", color: "var(--lilac-soft)", letterSpacing: ".1em", textTransform: "uppercase" }}>
              Fragrâncias & Cosméticos
            </p>
          </div>
        </div>

        {/* Botão carrinho */}
        <button
          onClick={onCartOpen}
          aria-label="Abrir carrinho"
          style={{
            position:       "relative",
            display:        "flex",
            alignItems:     "center",
            gap:            "var(--space-2)",
            padding:        "var(--space-2) var(--space-4)",
            background:     "rgba(255,255,255,.13)",
            backdropFilter: "blur(6px)",
            border:         "1px solid rgba(255,255,255,.22)",
            borderRadius:   "var(--radius-full)",
            color:          "#fff",
            fontWeight:     600,
            fontSize:       ".85rem",
            cursor:         "pointer",
            transition:     "background var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,.22)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,.13)"}
        >
          <Icons.Cart size={20} />
          {cartCount > 0 && (
            <span style={{
              position:   "absolute",
              top:        -9,
              right:      -9,
              minWidth:   22,
              height:     22,
              background: "var(--lilac)",
              color:      "var(--purple-deep)",
              fontWeight: 800,
              fontSize:   ".7rem",
              borderRadius: "var(--radius-full)",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              padding:    "0 5px",
              border:     "2.5px solid var(--purple-main)",
              animation:  "bounceCart .5s var(--ease-spring)",
            }}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}