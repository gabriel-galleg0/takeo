import { useState } from "react";
import { maskCEP } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import { calcularFrete } from "../../../../../utils/freteConfig.js"; // 1. IMPORTA A FUNÇÃO DO FRETE

export default function StepAddress({ addr, setAddr, onNext, onBack }) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [cepOk, setCepOk] = useState(false);

  const upd = (field) => (val) => setAddr((a) => ({ ...a, [field]: val }));

  const handleCepBlur = async () => {
    const raw = addr.cep.replace(/\D/g, "");
    if (raw.length !== 8) return;

    setCepLoading(true);
    setCepError("");
    setCepOk(false);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }

      setAddr((a) => ({
        ...a,
        rua: data.logradouro || a.rua,
        bairro: data.bairro || a.bairro,
        cidade: data.localidade && data.uf ? `${data.localidade} - ${data.uf}` : a.cidade,
        uf: data.uf || a.uf, // Injeta a UF limpa para o cálculo
      }));
      setCepOk(true);
    } catch {
      setCepError("Erro ao buscar o CEP.");
    } finally {
      setCepLoading(false);
    }
  };

  // 2. BUSCA AS INFORMAÇÕES DE VALOR E PRAZO BASEADO NO ESTADO ATUAL
  const frete = calcularFrete(addr.uf);

  // Validação: todos os campos obrigatórios precisam estar preenchidos
  const ok = addr.nome && addr.whatsapp && addr.email && addr.cep && addr.rua && addr.numero && addr.bairro && addr.cidade && addr.uf;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--purple-deep)" }}>
        Dados de Contato & Entrega
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
        {/* Dados Pessoais de Contato */}
        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Nome Completo *</label>
          <input className="input-form-base" value={addr.nome || ""} onChange={(e) => upd("nome")(e.target.value)} placeholder="Seu nome" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>WhatsApp *</label>
          <input value={addr.whatsapp || ""} onChange={(e) => upd("whatsapp")(e.target.value)} placeholder="(11) 99999-9999" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>E-mail *</label>
          <input type="email" value={addr.email || ""} onChange={(e) => upd("email")(e.target.value)} placeholder="seu@email.com" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        {/* Endereço */}
        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>CEP *</label>
          <input value={addr.cep || ""} onChange={(e) => { setCepError(""); setCepOk(false); upd("cep")(maskCEP(e.target.value)); }} onBlur={handleCepBlur} placeholder="00000-000" inputMode="numeric" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
          {cepLoading && <span style={{ position: "absolute", right: 12, top: "60%" }}>⏳</span>}
          {cepOk && <span style={{ position: "absolute", right: 12, top: "60%" }}>✅</span>}
          {cepError && <p style={{ fontSize: ".72rem", color: "#C2410C", fontWeight: 600 }}>⚠️ {cepError}</p>}
        </div>

        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Rua / Avenida *</label>
          <input value={addr.rua || ""} onChange={(e) => upd("rua")(e.target.value)} placeholder="Nome da rua" readOnly={cepLoading} style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--surface-2)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Número *</label>
          <input value={addr.numero || ""} onChange={(e) => upd("numero")(e.target.value)} placeholder="123" inputMode="numeric" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        <div style={{ flex: "1 1 45%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Complemento</label>
          <input value={addr.complemento || ""} onChange={(e) => upd("complemento")(e.target.value)} placeholder="Apto, bloco..." style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Bairro *</label>
          <input value={addr.bairro || ""} onChange={(e) => upd("bairro")(e.target.value)} placeholder="Seu bairro" readOnly={cepLoading} style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--surface-2)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Cidade / Estado *</label>
          <input value={addr.cidade || ""} onChange={(e) => upd("cidade")(e.target.value)} placeholder="Ex: São Paulo - SP" readOnly={cepLoading} style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--surface-2)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} />
        </div>

        {/* 3. BLOCO DE FEEDBACK DO FRETE: SÓ APARECE SE O CEP FOR ENCONTRADO COM SUCESSO */}
        {cepOk && addr.uf && (
          <div style={{ flex: "1 1 100%", marginTop: "var(--space-2)", padding: "var(--space-3) var(--space-4)", background: "rgba(124, 58, 237, 0.08)", border: "1px dashed var(--purple-mid)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "between", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.1rem" }}>🚚</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--purple-deep)" }}> Opção de Envio ({addr.uf})</span>
                <span style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>Prazo estimado: {frete.prazo}</span>
              </div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: ".9rem", fontWeight: 700, color: "var(--purple-main)" }}>
              {frete.valor === 0 ? "Grátis" : `R$ ${frete.valor.toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
        <button className="btn-lilac-secondary" onClick={onBack}><Icons.ChevronLeft size={14} /> Voltar</button>
        <button className="btn-purple-primary" onClick={onNext} disabled={!ok}>Ir para Pagamento <Icons.ChevronRight size={16} /></button>
      </div>
    </div>
  );
}