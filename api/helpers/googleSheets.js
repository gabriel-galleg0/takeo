const SHEETDB_URL = "https://sheetdb.io/api/v1/laqcc22y8k1wy"

// ============================================================
//  TAKEO PERFUMARIA — api/helpers/googleSheets.js
//  Gerenciador Central do Google Sheets (Padrão Vercel ES Modules)
// ============================================================

export async function salvarPedido({ idPedido, nome, email, whatsapp, endereco, metodo, total, cartItems, statusInicial }) {
  try {
    const produtosFormatados = (cartItems || [])
      .map(item => `${item.qty}x ${item.nome}`)
      .join(" | ");

    const rua = endereco?.rua || "";
    const numero = endereco?.numero || "";
    const complemento = endereco?.complemento ? `- ${endereco.complemento}` : "";
    const bairro = endereco?.bairro || "";
    const cidade = endereco?.cidade || "";
    const uf = endereco?.uf || "";
    const cep = endereco?.cep || "";
    
    const enderecoCompleto = `${rua}, Nº ${numero} ${complemento} - Bairro: ${bairro} - ${cidade}/${uf} (CEP: ${cep})`;

    const novoPedido = {
      id_pedido: idPedido,
      data_hora: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      cliente_nome: nome || "Cliente",
      cliente_whatsapp: whatsapp || "",
      cliente_email: email || "",
      endereco_completo: enderecoCompleto,
      produtos: produtosFormatados,
      total_pago: total,
      forma_pagamento: metodo,
      status_pagamento: statusInicial || "approved", 
      status_logistica: "Aguardando Separação", 
      codigo_rastreio: "",
      observacoes: ""
    };

    const response = await fetch(`${SHEETDB_URL}?sheet=Pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [novoPedido] })
    });

    if (!response.ok) throw new Error(`Falha no SheetDB: HTTP ${response.status}`);
    console.log(`🎉 Pedido ${idPedido} registrado com sucesso na planilha!`);
    return true;
  } catch (error) {
    console.error("❌ Erro no helper salvarPedido:", error);
    return false;
  }
}

export async function atualizarEstoque(cartItems) {
  try {
    for (const item of cartItems) {
      const idProduto = item.id;
      const quantidadeVendida = Number(item.qty || item.quantity || item.qtd || 1);

      // 🚀 PASSO 1: O Back-end consulta a planilha em tempo real para ver o estoque real do momento!
      const consultarRes = await fetch(`${SHEETDB_URL}/search?id=${idProduto}&sheet=Página1`);
      if (!consultarRes.ok) throw new Error("Não foi possível consultar o estoque real.");
      
      const produtoNoBanco = await consultarRes.json();
      
      // Se não achar o produto, pula para o próximo para não quebrar o loop
      if (!produtoNoBanco || produtoNoBanco.length === 0) {
        console.error(`⚠️ Produto ID ${idProduto} não encontrado na planilha para checar estoque.`);
        continue;
      }

      // Captura o valor exato que está escrito na célula da planilha AGORA
      const estoqueRealNaPlanilha = Number(produtoNoBanco[0].estoque || 0);

      // 🚀 PASSO 2: Faz a matemática usando o valor real do banco de dados, ignorando o que o front achava
      const novoEstoque = Math.max(0, estoqueRealNaPlanilha - quantidadeVendida);

      // PASSO 3: Grava o novo valor na aba de produtos
      const response = await fetch(`${SHEETDB_URL}/id/${idProduto}?sheet=Página1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            estoque: novoEstoque
          }
        })
      });

      if (!response.ok) {
        console.error(`⚠️ Falha ao atualizar estoque do produto ID ${idProduto}`);
      } else {
        console.log(`📉 Estoque do ID ${idProduto} reduzido em ${quantidadeVendida} un. (Valor real na planilha foi de ${estoqueRealNaPlanilha} para ${novoEstoque})`);
      }
    }
    return true;
  } catch (error) {
    console.error("❌ Erro no helper atualizarEstoque:", error);
    return false;
  }
}