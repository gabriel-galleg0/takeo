// ============================================================
//  TAKEO PERFUMARIA — components/Footer.jsx
//  Rodapé estruturado e elegante
// ============================================================
import { CONFIG } from "../../utils/formatters.js";

export default function Footer() {
  return (
    <footer style={{ 
      background: "var(--purple-deep)", 
      color: "rgba(233,213,255,.65)", 
      padding: "var(--space-12) var(--space-5) calc(var(--space-16) + 40px)", 
      fontSize: ".85rem", 
      borderTop: "1px solid rgba(255,255,255,.08)" 
    }}>
      <div style={{ 
        maxWidth: "var(--max-w)", 
        margin: "0 auto", 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
        gap: "var(--space-8)",
        marginBottom: "var(--space-8)"
      }}>
        {/* Coluna 1: Sobre a Loja */}
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "#fff", fontWeight: 600, marginBottom: "var(--space-3)" }}>
            🌸 {CONFIG.STORE_NAME}
          </h3>
          <p style={{ lineHeight: 1.6 }}>
            Sua megastore de cosméticos, fragrâncias premium e cuidados pessoais. Onde a beleza e a autoestima se encontram.
          </p>
        </div>

        {/* Coluna 2: Links Rápidos ou Categorias */}
        <div>
          <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: "var(--space-3)", textTransform: "uppercase", fontSize: ".75rem", letterSpacing: ".08em" }}>
            Nossos Diferenciais
          </h4>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <li>✨ Produtos 100% Originais</li>
            <li>🚚 Frete Rápido e Seguro</li>
            <li>💳 Parcelamento Facilitado</li>
          </ul>
        </div>

        {/* Coluna 3: Atendimento */}
        <div>
          <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: "var(--space-3)", textTransform: "uppercase", fontSize: ".75rem", letterSpacing: ".08em" }}>
            Atendimento ao Cliente
          </h4>
          <p style={{ lineHeight: 1.6 }}>
            Segunda a Sexta: 09h às 18h<br />
            Sábado: 09h às 13h
          </p>
        </div>
      </div>

      {/* Direitos Autorais */}
      <div style={{ 
        maxWidth: "var(--max-w)", 
        margin: "0 auto", 
        paddingTop: "var(--space-6)", 
        borderTop: "1px solid rgba(255,255,255,.05)", 
        textAlign: "center",
        fontSize: ".75rem"
      }}>
        <p>© {new Date().getFullYear()} {CONFIG.STORE_NAME}. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
      </div>
    </footer>
  );
}