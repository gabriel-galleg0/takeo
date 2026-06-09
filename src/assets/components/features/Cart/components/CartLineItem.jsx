import { fmt } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import ProductImage from "../../../ProductImage.jsx";

export default function CartLineItem({ item, onRemove, onQty }) {
  const price = item.preco_promo ?? item.preco;
  const atMax = item.qty >= item.estoque;

  return (
    <div style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-4) 0", borderBottom: "1px solid var(--border)", animation: "slideUp .22s var(--ease-out)" }}>
      <ProductImage src={item.imagem} alt={item.nome} style={{ width: 68, height: 68, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: ".9rem", color: "var(--purple-deep)", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.nome}
          </p>
          <button onClick={() => onRemove(item.id)} style={{ color: "var(--text-muted)", padding: "2px" }}>
            <Icons.Trash size={14} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--space-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", background: "var(--lilac-pale)", borderRadius: "var(--radius-full)", padding: "2px 6px" }}>
            <button onClick={() => item.qty === 1 ? onRemove(item.id) : onQty(item.id, item.qty - 1, item.estoque)} style={{ color: "var(--purple-mid)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icons.Minus size={13} />
            </button>
            <span style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--purple-deep)", minWidth: 18, textAlign: "center" }}>{item.qty}</span>
            <button onClick={() => !atMax && onQty(item.id, item.qty + 1, item.estoque)} disabled={atMax} style={{ color: atMax ? "var(--text-muted)" : "var(--purple-mid)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: atMax ? "not-allowed" : "pointer" }}>
              <Icons.Plus size={13} />
            </button>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: ".95rem", color: "var(--purple-mid)" }}>{fmt(price * item.qty)}</span>
        </div>
        {atMax && <p style={{ fontSize: ".63rem", color: "#C2410C", fontWeight: 600, marginTop: 3 }}>⚠️ Máx. em estoque</p>}
      </div>
    </div>
  );
}