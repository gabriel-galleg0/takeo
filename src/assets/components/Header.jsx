// ============================================================
//  TAKEO PERFUMARIA — components/Header.jsx
// ============================================================
import { useState, useEffect } from "react";
import { CONFIG } from "../../utils/formatters.js";
import { Icons } from "./Icons.jsx";

export default function Header({ cartCount, onCartOpen, searchValue, onSearchChange, isMobile, onGoHome }) {
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
      height:        "auto",
      minHeight:     "var(--header-h)",
      background:    scrolled
        ? "rgba(46,16,101,.97)"
        : "linear-gradient(135deg, var(--purple-deep), var(--purple-main))",
      backdropFilter: "blur(14px)",
      boxShadow:     scrolled ? "var(--shadow-lg)" : "none",
      transition:    "background var(--duration-base) var(--ease-out), box-shadow var(--duration-base) var(--ease-out)",
      display:       "flex",
      alignItems:    "center",
      padding:       "var(--space-2) var(--space-5)",
    }}>
      <div style={{
        width:          "100%",
        maxWidth:       "var(--max-w)",
        margin:         "0 auto",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            "var(--space-4)",
      }}>
        
        {/* Logo Clicável (Volta para a Home e limpa todos os filtros) */}
        <div 
          onClick={onGoHome}
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", cursor: "pointer", transition: "opacity 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
          onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
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

        {/* Busca no Header (Apenas Celular) */}
        {isMobile && (
          <div style={{ flex: "1 1 200px", maxWidth: "400px", position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".9rem" }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(255,255,255,.2)",
                background: "rgba(255,255,255,.08)",
                color: "#fff",
                fontSize: ".85rem",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Botão Carrinho */}
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
          }}
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
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}