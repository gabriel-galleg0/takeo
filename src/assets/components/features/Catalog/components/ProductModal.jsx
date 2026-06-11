// ============================================================
//  TAKEO PERFUMARIA — components/ProductModal.jsx
//  Modal Universal com Inteligência de Cross-Selling Isolada
// ============================================================
import { useEffect, useRef, useState, useMemo } from "react";
import { fmt } from "../../../../../utils/formatters.js";
import { Icons } from "../../../Icons.jsx";
import ProductImage from "../../../ProductImage.jsx";
import ProductCard from "./ProductCard.jsx"; 

// 🚀 REPARE: Agora recebemos a lista geral "products" em vez de "relatedProducts" pré-calculado!
export default function ProductModal({ product, products = [], onOpenModal, onClose, onAdd }) {
  const overlayRef = useRef(null);
  const scrollContainerRef = useRef(null); 
  const [isExpanded, setIsExpanded] = useState(false); 

  const hasPromo = product.preco_promo !== null && product.preco_promo !== "";
  const outOfStock = product.estoque === 0 || product.estoque === "0";
  const lowStock = product.estoque > 0 && product.estoque <= 3;

  // ============================================================
  // 🧠 CÉREBRO ISOLADO DA VENDA CASADA (Calcula tudo aqui dentro!)
  // ============================================================
  const computedRelatedProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    // 1. Normaliza a categoria do produto aberto para evitar erros de digitação/espaços
    const targetCategory = String(product.categoria || "").trim().toLowerCase();

    // 2. Filtra OBRIGATORIAMENTE apenas produtos da mesma categoria (Exclui o próprio item aberto)
    const sameCategoryItems = products.filter((p) => {
      const pCat = String(p.categoria || "").trim().toLowerCase();
      return pCat === targetCategory && String(p.id) !== String(product.id);
    });

    // 3. Captura as tags do produto aberto
    const targetTags = product.tags
      ? String(product.tags).split(",").map((t) => t.trim().toLowerCase())
      : [];

    // Se o produto não tiver tags cadastradas, retorna os primeiros da mesma categoria direto como plano B
    if (targetTags.length === 0) {
      return sameCategoryItems.slice(0, 6);
    }

    // 4. Sistema de Pontuação de Tags estilo YouTube/Amazon
    return sameCategoryItems
      .map((item) => {
        const itemTags = item.tags ? String(item.tags).split(",").map((t) => t.trim().toLowerCase()) : [];
        const points = itemTags.reduce((acc, tag) => acc + (targetTags.includes(tag) ? 1 : 0), 0);
        return { product: item, points };
      })
      // Ordena de forma decrescente: maior pontuação de tags equivalentes vai para o topo do carrossel
      .sort((a, b) => b.points - a.points)
      .map((obj) => obj.product)
      .slice(0, 6);
  }, [product, products]);

  // Fecha o modal ao apertar a tecla ESC
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Reseta o scroll para o topo e colapsa a descrição sempre que o produto mudar
  useEffect(() => {
    setIsExpanded(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [product]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Regra de negócio da legenda longa cortada
  const description = product.descricao_longa || product.descricao_curta || "Sem descrição disponível.";
  const shouldTruncate = description.length > 280;
  const displayedText = (shouldTruncate && !isExpanded) ? `${description.slice(0, 280)}...` : description;

  // Mapeamento dinâmico da Ficha Técnica (Ignora colunas estruturais do sistema)
  const systemKeys = ["id", "nome", "categoria", "subcategoria", "marca", "preco", "preco_promo", "preco_promocional", "imagem", "estoque", "destaque", "oferta_limitada", "descricao_curta", "descricao_longa", "tags"];
  const techSheet = Object.entries(product).filter(([key, val]) => {
    return !systemKeys.includes(key) && val !== null && val !== undefined && String(val).trim() !== "";
  });

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={{ position: "fixed", inset: 0, background: "rgba(15, 11, 28, 0.45)", backdropFilter: "blur(4px)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)", animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ background: "var(--surface)", width: "100%", maxWidth: "720px", maxHeight: "90vh", borderRadius: "var(--radius-xl)", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid var(--border)", animation: "scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        
        {/* Header do modal */}
        <div style={{ padding: "var(--space-4) var(--space-6)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: ".7rem", textTransform: "uppercase", fontWeight: 700, color: "var(--purple-mid)" }}>{product.marca || "Exclusivo"}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700, color: "var(--purple-deep)", marginTop: 2 }}>{product.nome}</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.X size={20} /></button>
        </div>

        {/* Corpo do modal com Scroll */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--space-6)", padding: "var(--space-6)" }}>
          
          {/* Seção Principal: Foto + Infos de Preço */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-5)", alignItems: "start" }}>
            <div style={{ position: "relative", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
              <ProductImage src={product.imagem} alt={product.nome} style={{ width: "100%", height: "auto", maxHeight: "300px", objectFit: "contain" }} />
              {hasPromo && (
                <span style={{ position: "absolute", top: 12, left: 12, background: "var(--purple-main)", color: "#fff", fontSize: ".7rem", fontWeight: 700, padding: "4px 8px", borderRadius: "var(--radius-md)" }}>OFERTA</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* Bloco de Preço Premium */}
              <div style={{ background: "var(--lilac-pale)", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-purple)" }}>
                {hasPromo ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: ".75rem", color: "var(--text-muted)", textDecoration: "line-through" }}>De: {fmt(product.preco)}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--purple-main)" }}>Por: {fmt(product.preco_promo)}</span>
                  </div>
                ) : (
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "var(--purple-deep)" }}>{fmt(product.preco)}</span>
                )}
                
                {/* Status de Estoque */}
                <div style={{ marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: outOfStock ? "#EF4444" : lowStock ? "#F97316" : "#10B981" }} />
                  <span style={{ fontSize: ".75rem", fontWeight: 600, color: outOfStock ? "#EF4444" : lowStock ? "#C2410C" : "#059669" }}>
                    {outOfStock ? "Esgotado no estoque" : lowStock ? `Apenas ${product.estoque} unidades restantes!` : "Disponível para entrega imediata"}
                  </span>
                </div>
              </div>

              {/* Descrição Dinâmica Adaptativa com Ver Mais */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h4 style={{ fontSize: ".8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Sobre o produto</h4>
                <p style={{ fontSize: ".85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{displayedText}</p>
                {shouldTruncate && (
                  <button onClick={() => setIsExpanded(!isExpanded)} style={{ background: "none", border: "none", color: "var(--purple-main)", fontWeight: 700, fontSize: ".8rem", cursor: "pointer", alignSelf: "flex-start", padding: "4px 0", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    {isExpanded ? "Ver menos" : "Ver descrição completa"} {isExpanded ? "▲" : "▼"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ficha Técnica Dinâmica */}
          {techSheet.length > 0 && (
            <section style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-4)" }}>
              <h4 style={{ fontSize: ".8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>Especificações Técnicas</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                {techSheet.map(([chave, valor]) => (
                  <div key={chave} style={{ display: "flex", gap: "10px", alignItems: "center", background: "var(--surface-2)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "1.1rem" }}>⚙️</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: ".7rem", textTransform: "uppercase", color: "var(--text-muted)", margin: 0, fontWeight: 600 }}>{chave}</p>
                      <p style={{ fontSize: ".82rem", color: "var(--text)", margin: 0, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{String(valor)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Carrossel de recomendados isolado e autônomo */}
          {computedRelatedProducts && computedRelatedProducts.length > 0 && (
            <section style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
                <h4 style={{ fontSize: ".8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--purple-deep)" }}>Aproveite e compre junto</h4>
                <span style={{ fontSize: ".7rem", background: "var(--purple-light)", color: "var(--purple-main)", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>RECOMENDADO</span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", overflowX: "auto", paddingBottom: "var(--space-2)", clipPath: "inset(0 0 -10px 0)" }}>
                {computedRelatedProducts.map((prod) => (
                  <div key={prod.id} style={{ width: "160px", flexShrink: 0 }}>
                    <ProductCard 
                      product={prod} 
                      onAdd={onAdd} 
                      onOpenModal={onOpenModal} 
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Rodapé Fixo do Modal: Ações */}
        <div style={{ padding: "var(--space-4) var(--space-5)", borderTop: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0, display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          {outOfStock ? (
            <div style={{ flex: 1, textAlign: "center", padding: "var(--space-3)", background: "var(--surface-2)", borderRadius: "var(--radius-lg)", color: "var(--text-muted)", fontWeight: 600, fontSize: ".85rem" }}>Produto Indisponível no Estoque</div>
          ) : (
            <>
              <button onClick={onClose} style={{ padding: "var(--space-3) var(--space-5)", background: "var(--lilac-pale)", border: "1.5px solid var(--border-purple)", borderRadius: "var(--radius-lg)", color: "var(--text-lilac)", fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>Fechar</button>
              <button onClick={() => { onAdd(product); onClose(); }} style={{ flex: 1, padding: "var(--space-3) var(--space-4)", background: "linear-gradient(135deg, var(--purple-main), var(--purple-mid))", color: "#fff", fontWeight: 700, fontSize: ".85rem", borderRadius: "var(--radius-lg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}><Icons.Cart size={16} /> Adicionar ao carrinho</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}