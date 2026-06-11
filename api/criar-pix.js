// ============================================================
//  TAKEO PERFUMARIA — api/criar-pix.js
// ============================================================
import mercadopago from 'mercadopago';
import { salvarPedido } from './helpers/googleSheets.js'; // Importamos o helper de salvar
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
    
    // 🚀 Capturamos os dados do checkout que vêm no corpo da requisição
    const { total, email, nome, addr, cartItems } = req.body;
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

    // 📦 REGISTO PREVENTIVO DO PEDIDO PIX NA TABELA
    // Guardamos o pedido com status_pagamento: "pending". Quando o cliente pagar, o status atualiza!
    const idPedidoUnico = `TK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    await salvarPedido({
      idPedido: idPedidoUnico,
      nome: nome || (addr && addr.nome),
      email: email,
      whatsapp: addr ? addr.whatsapp : "",
      endereco: addr,
      metodo: "pix",
      total: totalTratado,
      cartItems: cartItems || [],
      statusInicial: "pending" // Passamos como pendente para não dar baixa antes da hora
    });

    return res.status(200).json({
      id: result.id,
      qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
      qr_code: result.point_of_interaction.transaction_data.qr_code,
      id_pedido: idPedidoUnico // Enviamos o ID do pedido também no Pix
    });

  } catch (error) {
    console.error("❌ Erro na API criar-pix:", error);
    return res.status(500).json({
      error: "Erro interno ao gerar o QR Code do PIX.",
      details: error.message
    });
  }
}