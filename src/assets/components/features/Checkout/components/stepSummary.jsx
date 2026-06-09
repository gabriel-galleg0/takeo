// ============================================================
//  TAKEO PERFUMARIA — Checkout/components/StepSummary.jsx
// ============================================================
import { fmt } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import ProductImage from "../../../ProductImage.jsx";

export default function StepSummary({ cartItems, updateQty, removeItem, totalPrice, onNext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--purple-deep)" }}>
        Revise seu pedido
      </h3>

      {cartItems.map((item) => {
        const price    = item.preco_promo ?? item.preco;
        const atMax    = item.qty >= item.estoque;
        return (
          <div key={item.id} style={{
            display:       "flex",
            gap:           "var(--space-3)",
            padding:       "var(--space-3) 0",
            borderBottom:  "1px solid var(--border)",
          }}>
            <ProductImage
              src={item.imagem}
              alt={item.nome}
              style={{ width: 64, height: 64, borderRadius: "var(--radius-md)", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                <p style={{
                  fontFamily:      "var(--font-display)",
                  fontWeight:      600,
                  fontSize:        ".9rem",
                  color:           "var(--purple-deep)",
                  overflow:        "hidden",
                  display:         "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                  {item.nome}
                </p>
                <button onClick={() => removeItem(item.id)} style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  <Icons.Trash size={14} />
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "var(--space-2)" }}>
                {/* Qty stepper interno do checkout */}
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "var(--space-2)",
                  background:   "var(--lilac-pale)",
                  borderRadius: "var(--radius-full)",
                  padding:      "2px 6px",
                }}>
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1, item.estoque)}
                    style={{ color: "var(--purple-mid)", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Icons.Minus size={13} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--purple-deep)", minWidth: 18, textAlign: "center" }}>
                    {item.qty}
                  </span>
                  <button
                    onClick={() => !atMax && updateQty(item.id, item.qty + 1, item.estoque)}
                    disabled={atMax}
                    style={{
                      color:   atMax ? "var(--text-muted)" : "var(--purple-mid)",
                      width:   26,
                      height:  26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: atMax ? "not-allowed" : "pointer",
                    }}
                    title={atMax ? "Limite de estoque atingido" : undefined}
                  >
                    <Icons.Plus size={13} />
                  </button>
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: ".95rem", color: "var(--purple-mid)" }}>
                  {fmt(price * item.qty)}
                </span>
              </div>
              {item.qty >= item.estoque && (
                <p style={{ fontSize: ".65rem", color: "#C2410C", fontWeight: 600, marginTop: 4 }}>
                  ⚠️ Máximo disponível em estoque
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Totalizador */}
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
        padding:        "var(--space-4)",
        background:     "var(--lilac-pale)",
        borderRadius:   "var(--radius-lg)",
        border:         "1px solid var(--border-purple)",
        marginTop:      "var(--space-2)",
      }}>
        <span style={{ fontWeight: 700, color: "var(--purple-deep)" }}>Total do pedido</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "var(--purple-mid)" }}>
          {fmt(totalPrice)}
        </span>
      </div>

      {/* Botão Avançar usando as classes que limpamos */}
      <button className="btn-purple-primary" onClick={onNext}>
        Continuar para Entrega <Icons.ChevronRight size={16} />
      </button>
    </div>
  );
}