// ============================================================
//  TAKEO PERFUMARIA — api/criar-pix.js
// ============================================================
import mercadopago from 'mercadopago';
const { MercadoPagoConfig, Payment } = mercadopago;

export default async function handler(req, res) {
  // Configura os cabeçalhos de resposta para sempre devolver JSON e evitar o erro de parse do React
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
    
    const { total, email, nome } = req.body;
    const totalTratado = Number(total);

    const result = await payment.create({
      body: {
        transaction_amount: totalTratado,
        description: 'Compra - Takeo Perfumaria',
        payment_method_id: 'pix',
        payer: {
          email: email || 'cliente@takeoperfumaria.com.br',
          first_name: nome || 'Cliente Online',
          last_name: 'Takeo'
        },
      },
    });

    return res.status(200).json({
      id: result.id,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
      qr_code: result.point_of_interaction.transaction_data.qr_code,
    });

  } catch (error) {
    console.error('Erro Mercado Pago:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar Pix' });
  }
}