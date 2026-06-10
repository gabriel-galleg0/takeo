export default function HeroBanner({ count }) {
  return (
    <div style={{ background: "linear-gradient(135deg, var(--purple-deep) 0%, var(--purple-main) 60%, var(--purple-mid) 100%)", padding: "var(--space-12) var(--space-5)", position: "relative", overflow: "hidden", textAlign: "center" }}>
      {[ { top: -60, right: -60, size: 240, opacity: .15 }, { bottom: -80, left: -40, size: 300, opacity: .1 } ].map((orb, i) => (
        <div key={i} style={{ position: "absolute", top: orb.top, right: orb.right, bottom: orb.bottom, left: orb.left, width: orb.size, height: orb.size, borderRadius: "50%", background: `rgba(192,132,252,${orb.opacity})`, pointerEvents: "none" }} />
      ))}
      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: ".78rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--lilac)", marginBottom: "var(--space-3)" }}>
           Coleção Premium
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 6vw, 3.2rem)", fontWeight: 300, color: "#fff", lineHeight: 1.2, marginBottom: "var(--space-4)" }}>
          ✨️ Tudo para você se sentir  <em style={{ fontWeight: 700, color: "var(--lilac-soft)" }}>incrível</em>
        </h2>
        {count > 0 && <p style={{ fontSize: ".95rem", color: "rgba(233,213,255,.75)", marginBottom: "var(--space-6)" }}>{count} produtos disponíveis</p>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-2) var(--space-5)", background: "rgba(255,255,255,.1)", borderRadius: "var(--radius-full)", border: "1px solid rgba(255,255,255,.18)", color: "var(--lilac-soft)", fontSize: ".8rem", fontWeight: 500 }}>
          🚚 Frete grátis acima de R$150 · 💳 PIX com 5% de desconto
        </div>
      </div>
    </div>
  );
}