import { useState, useEffect } from "react";
import { fmt, maskCard, maskExpiry, maskCVV } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import { useToast } from "../../../../../Hooks/useToast.js"; // 🚀 Importado o seu Hook de Toast!

export default function StepPayment({ totalPrice, cartItems, addr, onBack, onFinish }) {
  const [method, setMethod] = useState("pix"); 
  const [card, setCard] = useState({ num: "", name: "", expiry: "", cvv: "" });
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pixDados, setPixDados] = useState(null);
  const [success, setSuccess] = useState(false);

  // 🚀 ESTADOS PARA TRATAMENTO DE ERROS SEM BLOQUEAR A TELA
  const [paymentError, setPaymentError] = useState(null);

  const [installmentOptions, setInstallmentOptions] = useState([]);
  const [lastBin, setLastBin] = useState("");

  const toast = useToast(); // Instanciado o seu sistema de avisos

  const updCard = (field) => (val) => {
    setCard((c) => ({ ...c, [field]: val }));
    if (paymentError) setPaymentError(null); // Limpa o erro assim que o usuário mexe no cartão
  };
  
  const cardOk = card.num.replace(/\s/g, "").length === 16 && 
                 card.name && 
                 card.expiry.length === 5 && 
                 card.cvv.length >= 3;

  const canFinish = method === "pix" || cardOk;

  const PUBLIC_KEY = "TEST-a9ed8d5b-9e3d-4e02-ae1e-4e492a7986e1"; 

  // Busca de parcelas via BIN
  useEffect(() => {
    const fetchInstallments = async () => {
      const cleanNum = card.num.replace(/\s/g, "");
      const currentBin = cleanNum.substring(0, 6);

      if (method === "credit_card" && currentBin.length >= 6 && currentBin !== lastBin) {
        setLastBin(currentBin);
        try {
          if (!window.MercadoPago) throw new Error("MercadoPago.js não carregado");
          const mp = new window.MercadoPago(PUBLIC_KEY);
          const response = await mp.getInstallments({ amount: String(totalPrice), bin: currentBin });
          if (response && response.length > 0) {
            setInstallmentOptions(response[0].payer_costs);
            setInstallments(response[0].payer_costs[0].installments);
          }
        } catch (error) { console.error("Erro parcelas:", error); }
      } else if (currentBin.length < 6 && installmentOptions.length > 0) {
        setInstallmentOptions([]); setLastBin("");
      }
    };
    fetchInstallments();
  }, [card.num, method, totalPrice, lastBin, installmentOptions.length]);

  const handleFinish = async () => {
    if (!canFinish) return;
    setLoading(true);
    setPaymentError(null); // Reseta erros antigos ao clicar

    if (method === "pix") {
      try {
        const response = await fetch("/api/criar-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total: Number((totalPrice * 0.95).toFixed(2)),
            email: addr.email,
            nome: addr.nome
          })
        });
        const dados = await response.json();
        if (response.ok) {
          setPixDados(dados);
        } else {
          throw new Error(dados.error);
        }
      } catch (err) {
        setPaymentError("Não foi possível gerar o PIX. Tente novamente.");
        toast.show("❌ Erro ao processar PIX", "error");
      } finally {
        setLoading(false); 
      }
    } else {
      try {
        const mp = new window.MercadoPago(PUBLIC_KEY);
        const [expiryMonth, expiryYear] = card.expiry.split("/");
        const fullYear = `20${expiryYear}`;
        const cleanCardNumber = card.num.replace(/\s/g, "");

        const bin = cleanCardNumber.substring(0, 6);
        const paymentMethods = await mp.getPaymentMethods({ bin });
        
        if (!paymentMethods || !paymentMethods.results || paymentMethods.results.length === 0) {
          throw new Error("Não conseguimos identificar a bandeira do cartão.");
        }

        const detectedMethodId = paymentMethods.results[0].id;

        const tokenResponse = await mp.createCardToken({
          cardNumber: cleanCardNumber,
          cardholderName: card.name,
          cardExpirationMonth: expiryMonth,
          cardExpirationYear: fullYear,
          securityCode: card.cvv,
          identificationType: "CPF",
          identificationNumber: "12345678909", 
          paymentMethodId: detectedMethodId 
        });

        if (!tokenResponse || !tokenResponse.id) {
          throw new Error("Verifique os dados digitados e tente de novo.");
        }

        const response = await fetch("/api/processar-cartao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenResponse.id,
            payment_method_id: detectedMethodId,
            total: Number(totalPrice.toFixed(2)),
            installments: method === "credit_card" ? Number(installments) : 1,
            email: addr.email,
            nome: addr.nome
          })
        });

        const dados = await response.json();

        if (response.ok) {
          if (dados.status === "approved" || dados.status === "in_process" || dados.status === "pending") {
            setSuccess(true);
            setTimeout(() => onFinish(), 1600);
          } else {
            // Se o Mercado Pago recusar internamente (Ex: FUND, SECU, EXPI)
            const msg = dados.status_detail === "cc_rejected_insufficient_amount" 
              ? "Cartão Recusado: Saldo ou limite insuficiente." 
              : "Cartão Recusado: Dados incorretos ou suspeita de fraude.";
            setPaymentError(msg);
            toast.show("💳 Cartão recusado pelo banco", "warning");
          }
        } else {
          throw new Error(dados.error || "Transação recusada pela operadora.");
        }

      } catch (err) {
        // 🚀 CUSTOMIZAÇÃO EXCLUSIVA DE TESTES (Traduz os códigos da tabela que você mandou)
        let customMessage = err.message;
        if (card.name === "FUND") customMessage = "Saldo ou limite insuficiente no cartão de crédito.";
        if (card.name === "SECU") customMessage = "Código de segurança (CVV) inválido.";
        if (card.name === "EXPI") customMessage = "Data de validade do cartão expirada.";
        if (card.name === "OTHE") customMessage = "Erro geral na transação. Use outro cartão.";

        setPaymentError(customMessage);
        toast.show("⚠️ Ops! Falha no pagamento", "error");
      } finally {
        setLoading(false); 
      }
    }
  };

  if (success) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justify: "center", gap: "var(--space-5)", padding: "var(--space-8) 0", textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--green-wa), #34d399)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <Icons.CheckCircle size={40} />
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--purple-deep)" }}>Pedido Confirmado! 🎉</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: ".9rem" }}>Obrigado! Seu pagamento foi processado com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--purple-deep)" }}>Forma de pagamento</h3>

      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button onClick={() => { setMethod("pix"); setPixDados(null); setPaymentError(null); }} style={{ flex: 1, padding: "var(--space-3)", border: `2px solid ${method === "pix" ? "var(--purple-mid)" : "var(--border-purple)"}`, borderRadius: "var(--radius-lg)", background: method === "pix" ? "var(--lilac-pale)" : "var(--surface)", color: "var(--purple-deep)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)", fontSize: ".85rem" }}>
          <Icons.Pix size={18} /> Pix
        </button>
        <button onClick={() => { setMethod("credit_card"); setPaymentError(null); }} style={{ flex: 1, padding: "var(--space-3)", border: `2px solid ${method === "credit_card" ? "var(--purple-mid)" : "var(--border-purple)"}`, borderRadius: "var(--radius-lg)", background: method === "credit_card" ? "var(--lilac-pale)" : "var(--surface)", color: "var(--purple-deep)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)", fontSize: ".85rem" }}>
          <Icons.CreditCard size={18} /> Crédito
        </button>
        <button onClick={() => { setMethod("debit_card"); setPaymentError(null); }} style={{ flex: 1, padding: "var(--space-3)", border: `2px solid ${method === "debit_card" ? "var(--purple-mid)" : "var(--border-purple)"}`, borderRadius: "var(--radius-lg)", background: method === "debit_card" ? "var(--lilac-pale)" : "var(--surface)", color: "var(--purple-deep)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-1)", fontSize: ".85rem" }}>
          <Icons.CreditCard size={18} /> Débito
        </button>
      </div>

      {method === "pix" && !pixDados && (
        <div style={{ background: "var(--green-wa-light)", border: "1.5px solid #6EE7B7", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", textAlign: "center" }}>
          <p style={{ fontWeight: 700, color: "#065F46" }}>Pague via Pix e ganhe 5% de desconto!</p>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.3rem", color: "#065F46", marginTop: "var(--space-3)" }}>Total: {fmt(totalPrice * 0.95)}</p>
        </div>
      )}

      {pixDados && method === "pix" && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontWeight: 700, color: 'var(--purple-deep)' }}>Escaneie o QR Code abaixo para pagar:</p>
          <img src={`data:image/jpeg;base64,${pixDados.qr_code_base64}`} alt="Mercado Pago QR Code" style={{ width: 180, height: 180, margin: '0 auto', borderRadius: 'var(--radius-md)' }} />
          <p style={{ fontSize: '.8rem', fontWeight: 600 }}>Ou use o Pix Copia e Cola:</p>
          <input readOnly value={pixDados.qr_code} onClick={(e) => { e.target.select(); document.execCommand('copy'); alert('Código copiado!'); }} style={{ width: '100%', padding: '8px', fontSize: '.75rem', textAlign: 'center', background: '#fff', border: '1px solid var(--border-purple)', borderRadius: '4px', cursor: 'pointer' }} />
          <button className="btn-purple-primary" onClick={() => { setSuccess(true); setTimeout(() => onFinish(), 1600); }}>Já efetuei o pagamento</button>
        </div>
      )}

      {method !== "pix" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Número do Cartão ({method === "credit_card" ? "Crédito" : "Débito"})</label><input value={card.num} onChange={(e) => updCard("num")(maskCard(e.target.value))} placeholder="0000 0000 0000 0000" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Nome no Cartão</label><input value={card.name} onChange={(e) => updCard("name")(e.target.value)} placeholder="Como está no cartão" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} /></div>
          
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Validade</label><input value={card.expiry} onChange={(e) => updCard("expiry")(maskExpiry(e.target.value))} placeholder="MM/AA" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} /></div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}><label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>CVV</label><input value={card.cvv} onChange={(e) => updCard("cvv")(maskCVV(e.target.value))} placeholder="123" style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)" }} /></div>
          </div>

          {method === "credit_card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--purple-deep)" }}>Parcelas</label>
              <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} disabled={installmentOptions.length === 0} style={{ width: "100%", padding: "var(--space-3) var(--space-4)", background: installmentOptions.length === 0 ? "var(--surface-2)" : "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-md)", color: "var(--purple-deep)" }}>
                {installmentOptions.length === 0 ? (
                  <option value={1}>Digite o cartão para ver as parcelas</option>
                ) : (
                  installmentOptions.map((opt) => (
                    <option key={opt.installments} value={opt.installments}>{opt.recommended_message}</option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>
      )}

      {/* 🚀 CAIXA DE FILTRO VISUAL PREMIUM PARA O ERRO (PERFEITO PARA CELULAR) */}
      {paymentError && (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          background: "#FEF2F2", 
          border: "1px solid #FCA5A5", 
          padding: "12px", 
          borderRadius: "var(--radius-lg)", 
          marginTop: "10px",
          animation: "fadeIn 0.2s ease-out"
        }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <p style={{ color: "#991B1B", fontSize: ".82rem", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
            {paymentError}
          </p>
        </div>
      )}

      {(!pixDados || method !== "pix") && (
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <button className="btn-lilac-secondary" onClick={onBack}><Icons.ChevronLeft size={14} /> Voltar</button>
          <button className="btn-purple-primary" onClick={handleFinish} disabled={!canFinish || loading}>
            {loading ? "Processando..." : method === "pix" ? "Gerar Pagamento" : "Confirmar Pagamento"}
          </button>
        </div>
      )}
    </div>
  );
}