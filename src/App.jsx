// ============================================================
//  TAKEO PERFUMARIA — App.jsx
//  Orquestrador: Landing Page Ikesaki + Filtro Checkbox Preço
// ============================================================
import { useState, useEffect, useCallback, useMemo } from "react";

import { CONFIG, parseProduct} from "./utils/formatters.js";
import {useCart} from"./Hooks/useCart.js";
import {useToast} from"./Hooks/useToast.js";

import Header           from "./assets/components/Header.jsx";
import Footer           from "./assets/components/Footer.jsx";
import { Icons }        from "./assets/components/Icons.jsx";
import ProductCard      from "./assets/components/features/Catalog/components/ProductCard.jsx";
import ProductModal     from "./assets/components/features/Catalog/components/ProductModal.jsx";
import CartDrawer       from "./assets/components/features/Cart/CartDrawer.jsx";
import HeroBanner       from "./assets/components/features/Catalog/HeroBanner.jsx";
import { FloatingCart} from "./assets/components/features/Cart/FloatingCart.jsx";
import { ToastContainer } from "./assets/components/features/Cart/FloatingCart.jsx";

export default function App() {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [cartOpen,       setCartOpen]       = useState(false);
  const [modalProduct,   setModalProduct]   = useState(null);
  
  const [search,         setSearch]         = useState("");
  const [viewCategory,   setViewCategory]   = useState(null);

  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 20;

  // Filtros Globais
  const [filterBrand,    setFilterBrand]    = useState("Todos");
  const [filterSub,      setFilterSub]      = useState("Todos");
  const [filterPromo,    setFilterPromo]    = useState(false);
  
  // 🚀 NOVO: Filtro de Preço via Checkbox/Radio
  const [priceRange,     setPriceRange]     = useState("Todos");

  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768);
  const [showScrollTop,  setShowScrollTop]  = useState(false);

  const cart  = useCart();
  const toast = useToast();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("scroll", handleScroll); };
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(CONFIG.SHEETDB_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Formato de dados inesperado vindo da API");
      
      const parsed = data.map(item => {
        const p = parseProduct(item);
        return {
          ...p,
          marca: p.marca || item.marca || item.Marca || "Outros",
          subcategoria: p.subcategoria || item.subcategoria || item.Subcategoria || "Outros",
          oferta_limitada: item.oferta_limitada === "TRUE" || item.oferta_limitada === "Sim" || item.oferta_limitada === true
        };
      });

      setProducts(parsed);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // 🌳 Árvore de Categorias para o Mega Menu do Header
  const categoryTree = useMemo(() => {
    const tree = {};
    products.forEach(p => {
      if (!p.categoria) return;
      if (!tree[p.categoria]) tree[p.categoria] = new Set();
      if (p.subcategoria && p.subcategoria !== "Outros") tree[p.categoria].add(p.subcategoria);
    });
    // Converte Sets para Arrays ordenados
    Object.keys(tree).forEach(k => { tree[k] = [...tree[k]].sort() });
    return tree;
  }, [products]);

  const categories = Object.keys(categoryTree).sort();
  const brands = useMemo(() => ["Todos", ...new Set(products.map(p => p.marca).filter(Boolean))].sort(), [products]);
  const subcategories = useMemo(() => {
    const target = viewCategory !== null ? products.filter(p => p.categoria === viewCategory) : products;
    return ["Todos", ...new Set(target.map(p => p.subcategoria).filter(Boolean))].sort();
  }, [products, viewCategory]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let scoreA = (a.destaque === true || a.destaque === "TRUE" ? 2 : 0) + (a.preco_promo !== null && a.preco_promo !== "" ? 1 : 0);
      let scoreB = (b.destaque === true || b.destaque === "TRUE" ? 2 : 0) + (b.preco_promo !== null && b.preco_promo !== "" ? 1 : 0);
      return scoreB - scoreA;
    });
  }, [products]);

  // 🌪️ Filtragem com Lógica de Faixa de Preço (Checkboxes)
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((p) => {
      const currentPrice = (p.preco_promo !== null && p.preco_promo !== "") ? Number(p.preco_promo) : Number(p.preco);

      const matchesSearch = !search.trim() || p.nome.toLowerCase().includes(search.trim().toLowerCase()) || p.categoria.toLowerCase().includes(search.trim().toLowerCase()) || p.marca.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = !viewCategory || p.categoria === viewCategory;
      const matchesSub      = filterSub === "Todos" || p.subcategoria === filterSub;
      const matchesBrand    = filterBrand === "Todos" || p.marca === filterBrand;
      const matchesPromo    = !filterPromo || (p.preco_promo !== null && p.preco_promo !== "");
      
      let matchesPrice = true;
      if (priceRange === "ate50") matchesPrice = currentPrice <= 50;
      else if (priceRange === "50a100") matchesPrice = currentPrice > 50 && currentPrice <= 100;
      else if (priceRange === "acima100") matchesPrice = currentPrice > 100;

      return matchesSearch && matchesCategory && matchesSub && matchesBrand && matchesPromo && matchesPrice;
    });
  }, [sortedProducts, search, viewCategory, filterSub, filterBrand, filterPromo, priceRange]);

  const isAnyFilterActive = useMemo(() => {
    return search.trim() !== "" || filterBrand !== "Todos" || filterSub !== "Todos" || filterPromo || priceRange !== "Todos";
  }, [search, filterBrand, filterSub, filterPromo, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const limitedTimeOffers = useMemo(() => products.filter(p => p.oferta_limitada).slice(0, 8), [products]);

  const handleMenuSelect = (categoria, subcategoria) => {
    setViewCategory(categoria);
    setFilterSub(subcategoria);
    setSearch(""); setFilterBrand("Todos"); setFilterPromo(false); setPriceRange("Todos"); setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoHome = () => {
    setViewCategory(null); setSearch(""); setFilterBrand("Todos"); setFilterSub("Todos"); setFilterPromo(false); setPriceRange("Todos"); setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdd = useCallback((product) => {
    cart.add(product); toast.show(`🛒 ${product.nome} adicionado!`, "info");
  }, [cart, toast]);

  return (
    <div style={{ minHeight: "100dvh", background: "#F3F4F6" }}>
      <ToastContainer toasts={toast.toasts} />
      
      <Header 
        cartCount={cart.totalItems} 
        onCartOpen={() => setCartOpen(true)} 
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setViewCategory(null); setCurrentPage(1); }}
        isMobile={isMobile}
        onGoHome={handleGoHome}
        categoryTree={categoryTree}
        onSelectCategory={handleMenuSelect}
      />

      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} />}
      
      {modalProduct && (
        <ProductModal 
          product={modalProduct} 
          relatedProducts={products.slice(0,6)} // Simplificado para o modal
          onOpenModal={setModalProduct}
          onClose={() => setModalProduct(null)} 
          onAdd={(p) => { handleAdd(p); setModalProduct(null); }} 
        />
      )}
      <FloatingCart totalItems={cart.totalItems} totalPrice={cart.totalPrice} onOpen={() => setCartOpen(true)} />

      {!isAnyFilterActive && !viewCategory && <HeroBanner />}

      {!isMobile && (
        <div style={{ maxWidth: "var(--max-w)", margin: "var(--space-6) auto 0", padding: "0 var(--space-5)" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 16, color: "var(--text-muted)", fontSize: "1.2rem" }}>🔍</span>
            <input type="text" placeholder="O que você está procurando hoje?" value={search} onChange={(e) => { setSearch(e.target.value); setViewCategory(null); setCurrentPage(1); }} style={{ width: "100%", padding: "16px 16px 16px 52px", borderRadius: "var(--radius-full)", border: "2px solid var(--border-purple)", background: "#fff", fontSize: "1rem", outline: "none", boxShadow: "var(--shadow-sm)" }} />
          </div>
        </div>
      )}

      {/* BLOCO PRINCIPAL DA PÁGINA */}
      <main style={{ background: "#FFFFFF", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)", maxWidth: "var(--max-w)", margin: "24px auto 60px", padding: "var(--space-6) var(--space-6)", position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

        {/* 🌪️ PAINEL DE FILTROS COM PREÇO EM DROPDOWN/RADIO */}
        <div style={{ background: "#F9FAFB", padding: "var(--space-4)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "center" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--purple-mid)" }}>Subcategoria</span>
            <select value={filterSub} onChange={(e) => { setFilterSub(e.target.value); setCurrentPage(1); }} style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: "#fff", fontSize: ".85rem", color: "var(--purple-deep)", outline: "none" }}>
              {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--purple-mid)" }}>Marca</span>
            <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1); }} style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: "#fff", fontSize: ".85rem", color: "var(--purple-deep)", outline: "none" }}>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: "var(--purple-mid)" }}>Faixa de Preço</span>
            <select value={priceRange} onChange={(e) => { setPriceRange(e.target.value); setCurrentPage(1); }} style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: "#fff", fontSize: ".85rem", color: "var(--purple-deep)", outline: "none" }}>
              <option value="Todos">Qualquer Valor</option>
              <option value="ate50">Até R$ 50,00</option>
              <option value="50a100">De R$ 51 a R$ 100,00</option>
              <option value="acima100">Acima de R$ 100,00</option>
            </select>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".85rem", fontWeight: 600, color: "var(--purple-deep)", cursor: "pointer", marginTop: 14 }}>
            <input type="checkbox" checked={filterPromo} onChange={(e) => { setFilterPromo(e.target.checked); setCurrentPage(1); }} style={{ width: 16, height: 16, accentColor: "var(--purple-main)" }} /> 🏷️ Em Oferta
          </label>

          {(isAnyFilterActive || viewCategory) && (
            <button onClick={handleGoHome} style={{ marginLeft: "auto", background: "none", border: "none", color: "#DC2626", fontWeight: 700, fontSize: ".8rem", cursor: "pointer", marginTop: 14 }}>✕ Limpar Tudo</button>
          )}
        </div>

        {/* LOADING & ERROR LAYOUT */}
        {loading && <p style={{ textAlign: "center", color: "var(--purple-mid)", padding: "40px" }}>Carregando Megastore...</p>}
        {error && <p style={{ textAlign: "center", color: "#DC2626", padding: "40px" }}>Erro: {error}</p>}

        {!loading && !error && (
          <>
            {(isAnyFilterActive || viewCategory) ? (
              <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--lilac-soft)", paddingBottom: 6, alignItems: "center" }}>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--purple-deep)" }}>
                    {viewCategory ? `Explorando ${viewCategory}` : "Resultados Encontrados"} ({filteredProducts.length})
                  </h2>
                </div>

                {filteredProducts.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "var(--space-12)" }}>Nenhum produto atende aos critérios marcados simultaneamente. 😕</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
                    {paginatedProducts.map((p) => <ProductCard key={p.id} product={p} onAdd={handleAdd} onOpenModal={setModalProduct} />)}
                  </div>
                )}

                {totalPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "var(--space-6)" }}>
                    <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: "#fff", color: "var(--purple-main)", cursor: "pointer" }}>&lt;</button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button key={i+1} onClick={() => { setCurrentPage(i+1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", border: "none", background: currentPage === i+1 ? "linear-gradient(135deg, var(--purple-main), var(--purple-mid))" : "var(--lilac-pale)", color: currentPage === i+1 ? "#fff" : "var(--purple-deep)", fontWeight: 700, cursor: "pointer" }}>{i+1}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: "#fff", color: "var(--purple-main)", cursor: "pointer" }}>&gt;</button>
                  </div>
                )}
              </section>
            ) : (
              
              /* 🚀 LANDING PAGE PRINCIPAL ESTILO IKESAKI */
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
                
                {/* SESSÃO 1: OFERTAS POR TEMPO LIMITADO (Requer a coluna oferta_limitada na planilha) */}
                {limitedTimeOffers.length > 0 && (
                  <section style={{ background: "rgba(220, 38, 38, 0.05)", padding: "var(--space-6)", borderRadius: "var(--radius-xl)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, color: "#DC2626", marginBottom: "var(--space-4)", display: "flex", alignItems: "center", gap: 8 }}>
                      ⏳ Ofertas por tempo limitado!
                    </h2>
                    <div style={{ display: "flex", gap: "var(--space-4)", overflowX: "auto", paddingBottom: "var(--space-4)", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                      {limitedTimeOffers.map((p) => (
                        <div key={p.id} style={{ flex: "0 0 250px", scrollSnapAlign: "start" }}>
                          <ProductCard product={p} onAdd={handleAdd} onOpenModal={setModalProduct} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* SESSÃO 2: PROVA SOCIAL / AVALIAÇÕES (Estático) */}
                <section style={{ background: "linear-gradient(135deg, var(--purple-deep), var(--purple-main))", borderRadius: "var(--radius-xl)", padding: "var(--space-8)", color: "#fff", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--space-3)", boxShadow: "0 10px 25px rgba(109,40,217,.3)" }}>
                  <div style={{ fontSize: "2rem" }}>⭐⭐⭐⭐⭐</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>A loja nº 1 em Cosméticos da Região</h3>
                  <p style={{ maxWidth: 600, opacity: 0.9, lineHeight: 1.6 }}>Entrega rápida, produtos originais e atendimento impecável! Mais de 4.000 avaliações satisfeitas no Google.</p>
                </section>

                {/* SESSÃO 3: VITRINE POR CATEGORIAS */}
                {categories.map((category) => {
                  const categoryProducts = sortedProducts.filter(p => p.categoria === category);
                  const carouselItems = categoryProducts.slice(0, 12);

                  return (
                    <section key={category} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--lilac-soft)", paddingBottom: 6 }}>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "var(--purple-deep)", textTransform: "capitalize" }}>
                          {category.toLowerCase() === "pele" ? "Tudo o que sua pele precisa ✨" : category.toLowerCase()}
                        </h2>
                        {categoryProducts.length > 12 && (
                          <button onClick={() => { setViewCategory(category); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ background: "none", border: "none", color: "var(--purple-main)", fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}>Ver todos ➔</button>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "var(--space-4)", overflowX: "auto", paddingBottom: "var(--space-4)", paddingTop: 4, scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
                        {carouselItems.map((p) => (
                          <div key={p.id} style={{ flex: "0 0 250px", scrollSnapAlign: "start" }}>
                            <ProductCard product={p} onAdd={handleAdd} onOpenModal={setModalProduct} />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}

              </div>
            )}
          </>
        )}
      </main>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: "fixed", bottom: "calc(var(--space-6) + 70px)", right: "var(--space-6)", width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, var(--purple-main), var(--purple-mid))", color: "#fff", border: "none", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>▲</button>
      )}

      <Footer />
    </div>
  );
}