export const TABELA_FRETE = {
  SP: { valor: 12.00, prazo: "2 a 4 dias úteis" },
  RJ: { valor: 18.00, prazo: "3 a 5 dias úteis" },
  MG: { valor: 15.00, prazo: "3 a 5 dias úteis" },
  ES: { valor: 16.00, prazo: "3 a 5 dias úteis" },
  // Região padrão caso o estado não esteja mapeado acima (ex: Norte, Nordeste, Sul)
  PADRAO: { valor: 25.00, prazo: "5 a 10 dias úteis" } 
};

export function calcularFrete(uf) {
  if (!uf) return { valor: 0, prazo: "" };
  const ufUpper = uf.toUpperCase().trim();
  return TABELA_FRETE[ufUpper] || TABELA_FRETE.PADRAO;
}