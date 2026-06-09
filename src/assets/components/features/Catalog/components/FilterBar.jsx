// ============================================================
//  TAKEO PERFUMARIA — components/ProductModal.jsx
//  Modal de detalhes: descricao_longa + Ficha Técnica dinâmica
// ============================================================
import { useEffect, useRef } from "react";
import { fmt, buildTechSheet } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import ProductImage from "../../../ProductImage.jsx";

const TECH_ICONS = {
  "Família Olfativa":   "🌺",
  "Notas de Topo":      "✨",
  "Notas de Coração":   "💜",
  "Fixação":            "⏱️",
  "Tipo de Cabelo":     "💇",
  "Principais Ativos":  "🧪",
  "Modo de Uso":        "📋",
  "Tipo de Pele":       "🌿",
  "Fragrância":         "🌸",
  "Benefícios":         "⭐",
  "Categoria":          "🏷️",
  "Tamanho":            "📦",
};
  
export default function ProductModal({ product, onClose, onAdd }) {
  const overlayRef = useRef(null);
  if (!product || typeof product !== "object" || !product.id) return null;
  const sheet = buildTechSheet(product);
  const hasPromo = product.preco_promo !== null;
  const outOfStock = product.estoque === 0;
  const lowStock = product.estoque > 0 && product.estoque <= 3;

  // Fechar com Escape
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position:        "fixed",
        inset:           0,
        background:      "rgba(17,7,40,.6)",
        backdropFilter:  "blur(6px)",
        zIndex:          600,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        padding:         "var(--space-4)",
        animation:       "fadeIn .25s var(--ease-out)",
      }}
    >
      <div style={{
        background:    "var(--surface)",
        borderRadius:  "var(--radius-xl)",
        width:         "100%",
        maxWidth:      720,
        maxHeight:     "92dvh",
        overflow:      "hidden",
        display:       "flex",
        flexDirection: "column",
        animation:     "scaleIn .3s var(--ease-spring)",
        boxShadow:     "var(--shadow-xl)",
      }}>
        {/* Imagem + close */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProductImage
            src={product.imagem}
            alt={product.nome}
            style={{ width: "100%", height: 280 }}
          />
          <div style={{
            position:   "absolute",
            inset:      0,
            background: "linear-gradient(to top, rgba(17,7,40,.55) 0%, transparent 55%)",
          }} />

          {/* Close btn */}
          <button
            onClick={onClose}
            style={{
              position:      "absolute",
              top:           14,
              right:         14,
              background:    "rgba(255,255,255,.18)",
              backdropFilter:"blur(8px)",
              border:        "1px solid rgba(255,255,255,.3)",
              borderRadius:  "var(--radius-full)",
              color:         "#fff",
              width:         38,
              height:        38,
              display:       "flex",
              alignItems:    "center",
              justifyContent:"center",
              cursor:        "pointer",
            }}
          >
            <Icons.X size={18} />
          </button>

          {/* Badges sobrepostos na imagem */}
          <div style={{
            position:      "absolute",
            bottom:        14,
            left:          14,
            display:       "flex",
            gap:           8,
            flexWrap:      "wrap",
          }}>
            {hasPromo && <span className="badge--promo">🏷️ PROMOÇÃO</span>}
            {product.destaque && (
              <span className="badge--promo" style={{ background: "rgba(46,16,101,.85)" }}>
                ⭐ Destaque
              </span>
            )}
            {lowStock && (
              <span style={{
                background:  "#C2410C",
                color:       "#fff",
                fontSize:    ".65rem",
                fontWeight:  700,
                padding:     "3px 9px",
                borderRadius:"var(--radius-full)",
                letterSpacing:".03em",
              }}>
                🔥 {product.estoque} restantes
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div style={{ overflowY: "auto", padding: "var(--space-6)", flex: 1 }}>
          {/* Meta */}
          <div style={{ marginBottom: "var(--space-4)" }}>
            <p style={{
              fontSize:      ".7rem",
              fontWeight:    700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color:         "var(--purple-mid)",
              marginBottom:  "var(--space-2)",
            }}>
              {product.categoria}
              {product.subcategoria && ` · ${product.subcategoria}`}
              {product.tamanho && ` · ${product.tamanho}`}
            </p>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize:   "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 600,
              color:      "var(--purple-deep)",
              lineHeight: 1.2,
            }}>
              {product.nome}
            </h2>
          </div>

          {/* Preço */}
          <div style={{ marginBottom: "var(--space-5)", display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
            {hasPromo ? (
              <>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--purple-mid)" }}>
                  {fmt(product.preco_promo)}
                </span>
                <span style={{ fontSize: "1rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                  {fmt(product.preco)}
                </span>
                <span style={{ fontSize: ".78rem", color: "var(--green-wa)", fontWeight: 700 }}>
                  {Math.round((1 - product.preco_promo / product.preco) * 100)}% OFF
                </span>
              </>
            ) : (
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--purple-deep)" }}>
                {fmt(product.preco)}
              </span>
            )}
          </div>

          {/* Descrição longa */}
          {product.descricao_longa && (
            <section style={{ marginBottom: "var(--space-6)" }}>
              <h3 style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "1.1rem",
                fontWeight:    600,
                color:         "var(--purple-deep)",
                marginBottom:  "var(--space-3)",
                paddingBottom: "var(--space-2)",
                borderBottom:  "2px solid var(--lilac-soft)",
              }}>
                Sobre o Produto
              </h3>
              <p style={{
                fontSize:   ".9rem",
                color:      "var(--text-secondary)",
                lineHeight: 1.75,
                whiteSpace: "pre-line",
              }}>
                {product.descricao_longa}
              </p>
            </section>
          )}

          {/* Ficha Técnica dinâmica */}
          <section style={{ marginBottom: "var(--space-6)" }}>
            <h3 style={{
              fontFamily:    "var(--font-display)",
              fontSize:      "1.1rem",
              fontWeight:    600,
              color:         "var(--purple-deep)",
              marginBottom:  "var(--space-4)",
              paddingBottom: "var(--space-2)",
              borderBottom:  "2px solid var(--lilac-soft)",
              display:       "flex",
              alignItems:    "center",
              gap:           "var(--space-2)",
            }}>
              {sheet.type === "perfume" ? "🌺" : sheet.type === "hair" ? "💇" : sheet.type === "skin" ? "🌿" : "📦"}
              Ficha Técnica
            </h3>
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap:                 "var(--space-3)",
            }}>
              {sheet.fields.map((f) => (
                <div
                  key={f.label}
                  style={{
                    background:   "var(--lilac-pale)",
                    borderRadius: "var(--radius-lg)",
                    padding:      "var(--space-4)",
                    border:       "1px solid var(--border-purple)",
                  }}
                >
                  <p style={{
                    fontSize:      ".68rem",
                    fontWeight:    700,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color:         "var(--purple-mid)",
                    marginBottom:  "var(--space-1)",
                  }}>
                    {TECH_ICONS[f.label] || "·"} {f.label}
                  </p>
                  <p style={{ fontSize: ".88rem", color: "var(--purple-deep)", fontWeight: 500, lineHeight: 1.4 }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer do modal */}
        <div style={{
          padding:       "var(--space-5) var(--space-6)",
          borderTop:     "1px solid var(--border)",
          background:    "var(--surface)",
          flexShrink:    0,
          display:       "flex",
          gap:           "var(--space-3)",
          alignItems:    "center",
        }}>
          {outOfStock ? (
            <div style={{
              flex:           1,
              textAlign:      "center",
              padding:        "var(--space-3)",
              background:     "var(--surface-2)",
              borderRadius:   "var(--radius-lg)",
              color:          "var(--text-muted)",
              fontWeight:     600,
              fontSize:       ".9rem",
            }}>
              Produto Esgotado
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                style={{
                  padding:      "var(--space-3) var(--space-5)",
                  background:   "var(--lilac-pale)",
                  border:       "1.5px solid var(--border-purple)",
                  borderRadius: "var(--radius-lg)",
                  color:        "var(--text-lilac)",
                  fontWeight:   600,
                  fontSize:     ".88rem",
                  cursor:       "pointer",
                  flexShrink:   0,
                }}
              >
                Voltar
              </button>
              <button
                onClick={() => { onAdd(product); onClose(); }}
                style={{
                  flex:           1,
                  padding:        "var(--space-3) var(--space-4)",
                  background:     "linear-gradient(135deg, var(--purple-main), var(--purple-mid))",
                  color:          "#fff",
                  fontWeight:     700,
                  fontSize:       ".95rem",
                  borderRadius:   "var(--radius-lg)",
                  border:         "none",
                  cursor:         "pointer",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            "var(--space-2)",
                  boxShadow:      "0 4px 16px rgba(109,40,217,.35)",
                }}
              >
                <Icons.Plus size={16} /> Adicionar ao Carrinho
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}