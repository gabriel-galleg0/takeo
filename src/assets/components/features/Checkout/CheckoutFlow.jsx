import { useState } from "react";
import { Icons } from "../../Icons.jsx";
import StepSummary from "../Checkout/components/stepSummary.jsx";
import StepAddress from "../Checkout/components/stepAddres.jsx";
import StepPayment from "../Checkout/components/stepPayment.jsx";
import { calcularFrete } from "../../../../utils/freteConfig.js"
function Stepper({ step }) {
  const steps = ["Resumo", "Entrega", "Pagamento"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--space-6)" }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: step >= idx ? "linear-gradient(135deg, var(--purple-main), var(--purple-mid))" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: step >= idx ? "#fff" : "var(--text-muted)", fontSize: ".8rem", fontWeight: 700 }}>
                {step > idx ? <Icons.Check size={15} /> : idx}
              </div>
              <span style={{ fontSize: ".65rem", fontWeight: step === idx ? 700 : 400, color: step === idx ? "var(--purple-mid)" : "var(--text-muted)" }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: step > idx ? "var(--purple-mid)" : "var(--border)", margin: "0 6px", marginBottom: 18 }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutFlow({ cart, onClose }) {
  const [step, setStep] = useState(1);
  
  // 2. ADICIONADO O CAMPO 'uf' NO ESTADO DO ENDEREÇO (Garante que o seu StepAddress preencha ele!)
  const [addr, setAddr] = useState({ 
    nome: "", whatsapp: "", email: "", cep: "", rua: "", 
    numero: "", complemento: "", bairro: "", cidade: "", uf: "" 
  });

  // 3. CÁLCULO DINÂMICO DO FRETE BASEADO NO ESTADO SELECIONADO
  const freteInfo = calcularFrete(addr.uf);
  const valorFrete = freteInfo.valor;

  // 4. SOMA DO PREÇO DOS PRODUTOS + VALOR DO FRETE
  const totalComFrete = cart.totalPrice + valorFrete;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "var(--space-5) var(--space-6) 0", flexShrink: 0 }}><Stepper step={step} /></div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 var(--space-6) var(--space-6)" }}>
        
        {step === 1 && (
          <StepSummary 
            cartItems={cart.items} 
            updateQty={cart.updateQty} 
            removeItem={cart.remove} 
            totalPrice={cart.totalPrice} 
            onNext={() => setStep(2)} 
          />
        )}
        
        {step === 2 && (
          <StepAddress 
            addr={addr} 
            setAddr={setAddr} 
            onNext={() => setStep(3)} 
            onBack={() => setStep(1)} 
          />
        )}
        
        {step === 3 && (
          <StepPayment 
            totalPrice={totalComFrete} // 🚀 PULO DO GATO: Passa o valor já somado com o frete para a API!
            cartItems={cart.items} 
            addr={addr} 
            onBack={() => setStep(2)} 
            onFinish={() => { cart.clear(); setTimeout(() => onClose(), 2200); }} 
          />
        )}
        
      </div>
    </div>
  );
}