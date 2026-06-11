// ============================================================
//  TAKEO PERFUMARIA — components/Header.jsx
//  Header com Mega Menu Ikesaki (Design Premium Integrado)
// ============================================================
import { useState, useEffect } from "react";
import { CONFIG } from "../../utils/formatters.js";
import { Icons } from "./Icons.jsx";

export default function Header({ cartCount, onCartOpen, searchValue, onSearchChange, isMobile, onGoHome, categoryTree, onSelectCategory }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header style={{ 
      position: "sticky", 
      top: 0, 
      zIndex: 300, 
      width: "100%",
      background: scrolled ? "rgba(46,16,101,.97)" : "linear-gradient(135deg, var(--purple-deep), var(--purple-main))",
      backdropFilter: "blur(14px)",
      boxShadow: scrolled ? "var(--shadow-lg)" : "none",
      transition: "all var(--duration-base) var(--ease-out)"
    }}>
      {/* 🔴 BARRA SUPERIOR (Logo, Busca, Carrinho) */}
      <div style={{ padding: "var(--space-3) var(--space-5)" }}>
        <div style={{ width: "100%", maxWidth: "var(--max-w)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
          
          <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, var(--lilac), var(--purple-mid))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", boxShadow: "0 2px 10px rgba(167,139,250,.45)" }}>🌸</div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{CONFIG.STORE_NAME}</h1>
              <p style={{ fontSize: ".62rem", color: "var(--lilac-soft)", letterSpacing: ".1em", textTransform: "uppercase" }}>Megastore Cosméticos</p>
            </div>
          </div>

          {/* Busca (Celular) */}
          {isMobile && (
            <div style={{ flex: "1 1 200px", maxWidth: "400px", position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: ".9rem" }}>🔍</span>
              <input type="text" placeholder="Buscar..." value={searchValue} onChange={(e) => onSearchChange(e.target.value)} onFocus={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "var(--radius-full)", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "#fff", fontSize: ".85rem", outline: "none" }} />
            </div>
          )}

          <button onClick={onCartOpen} style={{ position: "relative", display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-4)", background: "rgba(255,255,255,.13)", border: "1px solid rgba(255,255,255,.22)", borderRadius: "var(--radius-full)", color: "#fff", fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>
            <Icons.Cart size={20} />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -9, right: -9, minWidth: 22, height: 22, background: "var(--lilac)", color: "var(--purple-deep)", fontWeight: 800, fontSize: ".7rem", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid var(--purple-main)" }}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ⚪ MEGA MENU INFERIOR (Integrado ao visual roxo escuro) */}
      {!isMobile && categoryTree && Object.keys(categoryTree).length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.12)" }} onMouseLeave={() => setHoveredCategory(null)}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", display: "flex", alignItems: "center", gap: "var(--space-6)", padding: "0 var(--space-5)", position: "relative" }}>
            
            {Object.keys(categoryTree).map((cat) => (
              <div 
                key={cat} 
                onMouseEnter={() => setHoveredCategory(cat)}
                style={{ 
                  padding: "12px 0", 
                  cursor: "pointer", 
                  borderBottom: hoveredCategory === cat ? "3px solid var(--lilac)" : "3px solid transparent", 
                  color: hoveredCategory === cat ? "#fff" : "rgba(255,255,255,0.75)", 
                  fontWeight: hoveredCategory === cat ? 700 : 500, 
                  fontSize: ".82rem", 
                  textTransform: "uppercase", 
                  letterSpacing: ".05em", 
                  transition: "color 0.2s" 
                }}
                onClick={() => onSelectCategory(cat, "Todos")}
              >
                {cat}
              </div>
            ))}

            {/* CAIXA SUSPENSA DO MEGA MENU (Continua branca para o cliente ler perfeitamente) */}
            {hoveredCategory && categoryTree[hoveredCategory] && categoryTree[hoveredCategory].length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", background: "#fff", boxShadow: "0 15px 40px rgba(0,0,0,0.15)", zIndex: 400, display: "flex", padding: "var(--space-6) var(--space-5)", borderTop: "3px solid var(--purple-main)", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", animation: "fadeIn 0.2s ease-out" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-display)", color: "var(--purple-deep)", marginBottom: 4, textTransform: "capitalize" }}>
                    Departamentos em {hoveredCategory.toLowerCase()}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-3)" }}>
                    {categoryTree[hoveredCategory].map(sub => (
                      <span 
                        key={sub} 
                        onClick={() => { onSelectCategory(hoveredCategory, sub); setHoveredCategory(null); }}
                        style={{ fontSize: ".85rem", color: "var(--text-secondary)", cursor: "pointer", padding: "4px 0", transition: "color 0.2s" }}
                        onMouseEnter={(e) => e.target.style.color = "var(--purple-main)"}
                        onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </header>
  );
}