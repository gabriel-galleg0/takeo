// ============================================================
//  TAKEO PERFUMARIA — api/processar-cartao.js
//  Processador de Cartão Seguro (Padrão Vercel ES Modules)
// ============================================================
import mercadopago from 'mercadopago';
import { salvarPedido, atualizarEstoque } from './helpers/googleSheets.js'; 

const { MercadoPagoConfig, Payment } = mercadopago;

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'Token MP_ACCESS_TOKEN não configurado no .env' });
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const payment = new Payment(client);

    const { token: cardToken, payment_method_id, total, installments, email, nome, addr, cartItems } = req.body;

    const clienteNome     = nome || addr?.nome || "Cliente Online";
    const clienteEmail    = email || addr?.email || "cliente@takeoperfumaria.com.br";
    const clienteWhatsapp = addr?.whatsapp || addr?.telefone || "";
    const totalTratado    = Number(total) || 0;
    const itensCarrinho   = cartItems || [];

    const paymentData = {
      body: {
        transaction_amount: totalTratado,
        token: cardToken,
        description: "Compra - Takeo Perfumaria",
        installments: Number(installments) || 1,
        payment_method_id: payment_method_id,
        payer: {
          email: clienteEmail
        }
      }
    };

    const result = await payment.create(paymentData);

    if (result.status === "approved") {
      const idPedidoUnico = `TK-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
        await salvarPedido({
          idPedido: idPedidoUnico,
          nome: clienteNome,
          email: clienteEmail,
          whatsapp: clienteWhatsapp,
          endereco: addr || {},
          metodo: payment_method_id || "credit_card",
          total: totalTratado,
          cartItems: itensCarrinho
        });

        await atualizarEstoque(itensCarrinho);
      } catch (sheetError) {
        console.error("⚠️ Erro nas rotinas do Google Sheets:", sheetError.message);
      }

      return res.status(200).json({
        status: result.status,
        status_detail: result.status_detail,
        id: result.id,
        id_pedido: idPedidoUnico
      });
    }

    if (result.status) {
      return res.status(200).json({
        status: result.status,
        status_detail: result.status_detail,
        id: result.id
      });
    } else {
      throw new Error("Resposta inválida do gateway de pagamento.");
    }

  } catch (error) {
    console.error("❌ Erro na API processar-cartao:", error);
    return res.status(500).json({
      error: "Erro interno ao processar o pagamento com cartão.",
      details: error.message
    });
  }
}