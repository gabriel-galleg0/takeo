export const CONFIG = {
  SHEETDB_URL:    "https://sheetdb.io/api/v1/laqcc22y8k1wy",
  STORE_NAME:     "Takeo Perfumaria",
  CURRENCY:       "BRL",
  LOCALE:         "pt-BR",
  INSTALLMENTS:   3,
  FALLBACK_IMAGE: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=600&q=80&auto=format&fit=crop",
};

export const fmt = (val) =>
  Number(val || 0).toLocaleString(CONFIG.LOCALE, {
    style:    "currency",
    currency: CONFIG.CURRENCY,
  });

export function resolveImage(raw) {
  if (!raw || typeof raw !== "string" || !raw.trim()) return CONFIG.FALLBACK_IMAGE;
  const url = raw.trim();
  if (url.includes("instagram.com") || url.includes("cdninstagram.com")) return CONFIG.FALLBACK_IMAGE;
  return url;
}

export function parseProduct(row, index) {
  const toNum = (v) => parseFloat(String(v || "0").replace(",", ".")) || 0;
  const promo = toNum(row.preco_promocional);
  const stock = parseInt(String(row.quantidade_estoque ?? "99"), 10);

  return {
    id:              row.id           || `p-${index}`,
    nome:            row.nome         || "Produto sem nome",
    descricao_curta: row.descricao_curta || "",
    descricao_longa: row.descricao_longa || "",
    categoria:       (row.categoria   || "Outros").trim(),
    subcategoria:    (row.subcategoria || "").trim(),
    tamanho:         (row.tamanho     || "").trim(),
    preco:           toNum(row.preco),
    preco_promo:     promo > 0 ? promo : null,
    imagem:          resolveImage(row.imagem),
    destaque:        String(row.destaque || "").toLowerCase() === "sim",
    estoque:         isNaN(stock) ? 99 : Math.max(0, stock),
    familia_olfativa:   row.familia_olfativa   || "",
    notas_topo:         row.notas_topo         || "",
    notas_coracao:      row.notas_coracao       || "",
    fixacao:            row.fixacao             || "",
    tipo_cabelo:        row.tipo_cabelo         || "",
    principais_ativos:  row.principais_ativos   || "",
    modo_uso:           row.modo_uso            || "",
    tipo_pele:          row.tipo_pele           || "",
    fragrancia:         row.fragrancia          || "",
    beneficios:         row.beneficios          || "",
  };
}

export function buildTechSheet(product) {
  const cat = (product.categoria + " " + product.subcategoria).toLowerCase();
  const matches = (txt, keys) => keys.some((k) => txt.includes(k));

  if (matches(cat, ["perfume", "colônia", "eau de", "fragrance", "fragrância"])) {
    return {
      type: "perfume",
      fields: [
        { label: "Família Olfativa", value: product.familia_olfativa || "Floral Amadeirado" },
        { label: "Notas de Topo",    value: product.notas_topo       || "Bergamota, Pimenta Rosa" },
        { label: "Notas de Coração", value: product.notas_coracao    || "Rosa, Íris, Jasmim" },
        { label: "Fixação",          value: product.fixacao          || "8–12 horas" },
      ],
    };
  }

  if (matches(cat, ["shampoo", "cabelo", "condicionador", "máscara capilar"])) {
    return {
      type: "hair",
      fields: [
        { label: "Tipo de Cabelo",    value: product.tipo_cabelo       || "Todos os tipos" },
        { label: "Principais Ativos", value: product.principais_ativos || "Queratina, Argan, Biotina" },
        { label: "Modo de Uso",       value: product.modo_uso         || "Aplique, massageie e enxágue" },
      ],
    };
  }

  if (matches(cat, ["sabonete", "skincare", "creme", "hidratante", "sérum", "protetor"])) {
    return {
      type: "skin",
      fields: [
        { label: "Tipo de Pele", value: product.tipo_pele  || "Todos os tipos" },
        { label: "Fragrância",   value: product.fragrancia || "Suave e floral" },
        { label: "Benefícios",   value: product.beneficios || "Hidratação, nutrição e maciez" },
      ],
    };
  }

  return {
    type: "generic",
    fields: [
      { label: "Categoria",  value: product.categoria    || "—" },
      { label: "Tamanho",    value: product.tamanho      || "—" },
      { label: "Modo de Uso",value: product.modo_uso     || "Conforme indicação" },
    ],
  };
}

export const maskCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
export const maskExpiry = (v) => v.replace(/\D/g,"").slice(0,4).replace(/(.{2})/,"$1/");
export const maskCVV = (v) => v.replace(/\D/g,"").slice(0,4);
export const maskCEP = (v) => v.replace(/\D/g,"").slice(0,8).replace(/(\d{5})(\d)/,"$1-$2");