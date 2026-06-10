// ============================================================
//  TAKEO PERFUMARIA — components/ProductModal.jsx
//  Modal Universal Estilo Megastore Amazon (Sem campos fixos)
// ============================================================
import { useEffect, useRef, useState } from "react";
import { fmt } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import ProductImage from "../../../ProductImage.jsx";
import ProductCard from "./ProductCard.jsx"; 

export default function ProductModal({ product, relatedProducts, onOpenModal, onClose, onAdd }) {
  const overlayRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false); // Estado para o "Ver Mais" da descrição

  const hasPromo = product.preco_promo !== null && product.preco_promo !== "";
  const outOfStock = product.estoque === 0 || product.estoque === "0";
  const lowStock = product.estoque > 0 && product.estoque <= 3;

  // Fecha o modal ao apertar a tecla ESC
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

  // 📝 REGRA DE NEGÓCIO DA LEGENDA LONGA: Limita a 250 caracteres antes do "Ver Mais"
  const textLimit = 250;
  const rawDescription = product.descricao_longa || product.descricao_curta || "";
  const shouldTruncate = rawDescription.length > textLimit;
  
  const displayedDescription = isExpanded 
    ? rawDescription 
    : (shouldTruncate ? `${rawDescription.substring(0, textLimit)}...` : rawDescription);

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
        maxWidth:      640, // Um pouco mais estreito para o visual em bloco ficar mais focado
        maxHeight:     "85dvh", // Não ocupa a tela inteira, estilo pop-up premium
        overflow:      "hidden",
        display:       "flex",
        flexDirection: "column",
        animation:     "scaleIn .3s var(--ease-spring)",
        boxShadow:     "0 20px 50px rgba(0,0,0,0.15)",
      }}>
        
        {/* Topo do Modal: Imagem do Produto */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProductImage src={product.imagem} alt={product.nome} style={{ width: "100%", height: 260, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)" }} />

          {/* Botão X para Fechar */}
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,.25)", backdropFilter:"blur(8px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "50%", color: "#fff", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent:"center", cursor: "pointer", transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
            <Icons.X size={16} />
          </button>

          {/* Badges de Destaque, Promoção e Estoque Baixo */}
          <div style={{ position: "absolute", bottom: 12, left: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {hasPromo && <span className="badge--promo">🏷️ PROMOÇÃO</span>}
            {(product.destaque === true || product.destaque === "TRUE") && <span className="badge--promo" style={{ background: "rgba(46,16,101,.85)" }}>⭐ DESTAQUE</span>}
            {lowStock && <span style={{ background: "#DC2626", color: "#fff", fontSize: ".65rem", fontWeight: 700, padding: "3px 9px", borderRadius:"var(--radius-full)" }}>🔥 ÚLTIMAS {product.estoque} UNIDADES!</span>}
          </div>
        </div>

        {/* Corpo do Modal: Dados Textuais Gerais e Cross-Selling */}
        <div style={{ overflowY: "auto", padding: "var(--space-5)", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          
          {/* Títulos */}
          <div>
            <p style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--purple-mid)", marginBottom: 4 }}>
              {product.categoria} {product.subcategoria && ` · ${product.subcategoria}`} {product.marca && ` · ${product.marca}`}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--purple-deep)", lineHeight: 1.2 }}>
              {product.nome}
            </h2>
          </div>

          {/* Preços */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
            {hasPromo ? (
              <>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--purple-mid)" }}>{fmt(product.preco_promo)}</span>
                <span style={{ fontSize: ".9rem", color: "var(--text-muted)", textDecoration: "line-through" }}>{fmt(product.preco)}</span>
              </>
            ) : (
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--purple-deep)" }}>{fmt(product.preco)}</span>
            )}
          </div>

          {/* Legenda/Descrição com Botão Ver Mais colapsável */}
          {rawDescription && (
            <section style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
              <h3 style={{ fontSize: ".85rem", fontWeight: 700, color: "var(--purple-deep)", marginBottom: 6 }}>Descrição do Produto</h3>
              <p style={{ fontSize: ".88rem", color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {displayedDescription}
              </p>
              {shouldTruncate && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ background: "none", border: "none", color: "var(--purple-main)", fontWeight: 700, fontSize: ".82rem", padding: "4px 0", cursor: "pointer", outline: "none" }}
                >
                  {isExpanded ? "▲ Ler menos" : "▼ Ler descrição completa"}
                </button>
              )}
            </section>
          )}

          {/* 🚀 CROSS-SELLING LIMPO: Sugestões Baseadas nas Tags da Planilha */}
          {relatedProducts && relatedProducts.length > 0 && (
            <section style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-4)", borderTop: "1px dashed var(--lilac-soft)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: ".9rem", fontWeight: 700, color: "var(--purple-deep)", marginBottom: "var(--space-3)" }}>
                Aproveite e compre junto:
              </h3>
              <div style={{ display: "flex", gap: "var(--space-4)", overflowX: "auto", paddingBottom: "var(--space-2)", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                {relatedProducts.map((p) => (
                  <div key={p.id} style={{ flex: "0 0 180px", scrollSnapAlign: "start" }}>
                    <ProductCard product={p} onAdd={onAdd} onOpenModal={onOpenModal} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Rodapé Fixo do Modal: Ações */}
        <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          {outOfStock ? (
            <div style={{ flex: 1, textAlign: "center", padding: "var(--space-3)", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)", fontWeight: 600, fontSize: ".85rem" }}>Produto Indisponível no Estoque</div>
          ) : (
            <>
              <button onClick={onClose} style={{ padding: "var(--space-3) var(--space-5)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-lg)", color: "var(--text-lilac)", fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>Fechar</button>
              <button onClick={() => { onAdd(product); onClose(); }} style={{ flex: 1, padding: "var(--space-3) var(--space-4)", background: "linear-gradient(135deg, var(--purple-main), var(--purple-mid))", color: "#fff", fontWeight: 700, fontSize: ".85rem", borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}>
                <Icons.Plus size={15} /> Adicionar ao Carrinho
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}