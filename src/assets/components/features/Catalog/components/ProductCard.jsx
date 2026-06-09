import { useState } from "react";

export default function ProductCard({ product, onAdd, onOpenModal, style }) {
  const [adding, setAdding] = useState(false);
  const hasPromo = product.preco_promo !== null;

  const handleAdd = (e) => {
    e.stopPropagation(); // Impede de abrir o modal ao clicar no botão de compra
    if (!product.estoque) return;
    setAdding(true);
    onAdd(product);
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      onClick={() => onOpenModal(product)}
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all var(--duration-base) var(--ease-out)",
        animation: "scaleIn 0.35s var(--ease-out) both",
        ...style,
      }}
    >
      {/* Imagem */}
      <div style={{ position: "relative", height: "200px", background: "var(--surface-2)" }}>
        <img src={product.imagem} alt={product.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {hasPromo && <span className="badge--promo">🏷️ PROMOÇÃO</span>}
          {product.destaque && <span style={{ background: "rgba(46,16,101,.85)", color: "#E9D5FF", fontSize: ".65rem", fontWeight: 700, padding: "3px 8px", borderRadius: "var(--radius-full)" }}>⭐ DESTAQUE</span>}
        </div>

        {!product.estoque && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(17,7,40,.55)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: ".8rem", fontWeight: 600, padding: "6px 16px", borderRadius: "var(--radius-full)" }}>Esgotado</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", flex: 1, gap: "var(--space-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: ".7rem", fontWeight: 600, color: "var(--purple-mid)", textTransform: "uppercase" }}>{product.categoria}</span>
          {product.quantidade_estoque > 0 && product.quantidade_estoque <= 3 && (
            <span style={{ fontSize: ".65rem", color: "#DC2626", fontWeight: 700, background: "#FEF2F2", padding: "2px 6px", borderRadius: "4px" }}>🔥 Últimas {product.quantidade_estoque}!</span>
          )}
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, color: "var(--purple-deep)", minHeight: "2.6rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.nome}
        </h3>

        {/* Preço */}
        <div style={{ marginTop: "auto", paddingTop: "var(--space-2)" }}>
          {hasPromo ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--purple-mid)" }}>
                {Number(product.preco_promo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span style={{ fontSize: ".85rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                {Number(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          ) : (
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 700, color: "var(--purple-deep)" }}>
              {Number(product.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.estoque}
          style={{
            marginTop: "var(--space-2)",
            width: "100%",
            padding: "var(--space-2) var(--space-4)",
            background: product.estoque ? "linear-gradient(135deg, var(--purple-main), var(--purple-mid))" : "var(--surface-2)",
            color: product.estoque ? "#fff" : "var(--text-muted)",
            fontWeight: 600,
            fontSize: ".85rem",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {adding ? "✨ Adicionado!" : "⚡ Comprar"}
        </button>
      </div>
    </div>
  );
}