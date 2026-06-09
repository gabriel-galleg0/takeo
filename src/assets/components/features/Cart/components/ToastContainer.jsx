// ============================================================
//  TAKEO PERFUMARIA — components/ToastContainer.jsx
// ============================================================

const TOAST_COLORS = {
  info:    { bg: "var(--purple-deep)", accent: "var(--lilac)" },
  success: { bg: "#065F46",           accent: "#6EE7B7"       },
  error:   { bg: "#7F1D1D",           accent: "#FCA5A5"       },
};

export default function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => {
        const colors = TOAST_COLORS[t.type] || TOAST_COLORS.info;
        return (
          <div
            key={t.id}
            className="toast"
            style={{
              background: colors.bg,
              borderLeft: `3px solid ${colors.accent}`,
            }}
          >
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}