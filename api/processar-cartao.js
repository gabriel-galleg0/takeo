import mercadopago from 'mercadopago';
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

    const { token: cardToken, payment_method_id, total, installments, email } = req.body;

    // Payload 100% dinâmico e aderente à documentação oficial da API v2
    const paymentData = {
      body: {
        transaction_amount: Number(total),
        token: cardToken,
        description: "Compra - Takeo Perfumaria",
        installments: Number(installments),
        payment_method_id: payment_method_id, // Repassa exatamente o que o front-end detectou
        payer: {
          email: email || 'comprador_teste@testuser.com'
        }
      }
    };

    const result = await payment.create(paymentData);

    if (result.status) {
      return res.status(200).json({
        status: result.status,
        status_detail: result.status_detail,
        id: result.id
      });
    } else {
      throw new Error("Resposta inválida recebida do gateway de pagamento.");
    }

  } catch (error) {
    console.error('Erro Cartão Mercado Pago:', error);
    return res.status(500).json({ error: error.message || 'Erro ao processar transação com cartão' });
  }
}