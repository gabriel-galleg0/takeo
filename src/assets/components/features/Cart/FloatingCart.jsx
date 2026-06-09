// ============================================================
//  TAKEO PERFUMARIA — components/FloatingCart.jsx
//  Botão flutuante inferior com total + componente de Toasts
// ============================================================
import { fmt } from "../../../../utils/formatters.js";
import { Icons } from "../../Icons.jsx";

// ── Botão flutuante ──────────────────────────────────────────
export function FloatingCart({ totalItems, totalPrice, onOpen }) {
  if (totalItems === 0) return null;

  return (
    <button
      onClick={onOpen}
      style={{
        position:       "fixed",
        bottom:         "var(--space-6)",
        left:           "50%",
        transform:      "translateX(-50%)",
        zIndex:         300,
        display:        "flex",
        alignItems:     "center",
        gap:            "var(--space-3)",
        padding:        "var(--space-4) var(--space-6)",
        background:     "linear-gradient(135deg, var(--purple-main), var(--purple-mid))",
        color:          "#fff",
        fontWeight:     700,
        fontSize:       ".92rem",
        borderRadius:   "var(--radius-full)",
        boxShadow:      "var(--shadow-xl), 0 0 0 4px rgba(109,40,217,.15)",
        border:         "none",
        cursor:         "pointer",
        animation:      "slideUp .4s var(--ease-spring)",
        whiteSpace:     "nowrap",
        maxWidth:       "calc(100vw - 3rem)",
      }}
    >
      <span style={{
        background:     "rgba(255,255,255,.2)",
        borderRadius:   "var(--radius-full)",
        width:          26,
        height:         26,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        fontWeight:     800,
        fontSize:       ".8rem",
        flexShrink:     0,
      }}>
        {totalItems}
      </span>
      <Icons.Cart size={18} />
      Ver Carrinho · {fmt(totalPrice)}
    </button>
  );
}

// ── Toasts ───────────────────────────────────────────────────
const TOAST_COLORS = {
  info:    { bg: "var(--purple-deep)", accent: "var(--lilac)" },
  success: { bg: "#065F46",           accent: "#6EE7B7"       },
  error:   { bg: "#7F1D1D",           accent: "#FCA5A5"       },
};

export function ToastContainer({ toasts }) {
  return (
    <div style={{
      position:       "fixed",
      top:            "calc(var(--header-h) + var(--space-4))",
      right:          "var(--space-4)",
      zIndex:         700,
      display:        "flex",
      flexDirection:  "column",
      gap:            "var(--space-2)",
      pointerEvents:  "none",
    }}>
      {toasts.map((t) => {
        const colors = TOAST_COLORS[t.type] || TOAST_COLORS.info;
        return (
          <div
            key={t.id}
            style={{
              background:   colors.bg,
              color:        "#fff",
              padding:      "var(--space-3) var(--space-5)",
              borderRadius: "var(--radius-lg)",
              fontSize:     ".85rem",
              fontWeight:   500,
              boxShadow:    "var(--shadow-lg)",
              animation:    "slideUp var(--duration-base) var(--ease-spring)",
              pointerEvents:"auto",
              display:      "flex",
              alignItems:   "center",
              gap:          "var(--space-2)",
              maxWidth:     320,
              borderLeft:   `3px solid ${colors.accent}`,
            }}
          >
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}