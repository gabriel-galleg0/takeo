// ============================================================
//  TAKEO PERFUMARIA — App.jsx
//  Orquestrador: Vitrine com Paginação Estilo Amazon (1, 2, 3...) + Filtros
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

  // 🚀 NOVOS ESTADOS PARA A PAGINAÇÃO E FILTROS DA AMAZON
  const [currentPage,    setCurrentPage]    = useState(1);
  const itemsPerPage = 20; // Mostra exatamente 20 produtos por página

  // Filtros internos da categoria focada
  const [filterSub,      setFilterSub]      = useState("Todos");
  const [filterPromo,    setFilterPromo]    = useState(false);

  const cart  = useCart();
  const toast = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(CONFIG.SHEETDB_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Formato inesperado");
      setProducts(data.map(parseProduct));
    } catch (err) {
      console.error("[Takeo]", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const categories = useMemo(() => {
    const cats = products.map((p) => p.categoria).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [products]);

  // 🔍 1. MODO BUSCA: Filtro Geral do Header
  const searchFilteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    );
  }, [products, search]);

  // 🌪️ 2. MODO AMAZON: Filtros aplicados DENTRO da categoria selecionada
  const categoryFilteredProducts = useMemo(() => {
    if (!viewCategory) return [];
    
    return products.filter((p) => {
      const matchesCategory = p.categoria === viewCategory;
      const matchesSub = filterSub === "Todos" || p.subcategoria === filterSub;
      const matchesPromo = !filterPromo || p.preco_promo !== null;
      return matchesCategory && matchesSub && matchesPromo;
    });
  }, [products, viewCategory, filterSub, filterPromo]);

  // 🏷️ Subcategorias dinâmicas baseadas na categoria atual para montar o filtro do topo
  const currentSubcategories = useMemo(() => {
    if (!viewCategory) return [];
    const subs = products
      .filter((p) => p.categoria === viewCategory && p.subcategoria)
      .map((p) => p.subcategoria);
    return ["Todos", ...new Set(subs)].sort();
  }, [products, viewCategory]);

  // 📑 3. CÁLCULO DE PAGINAÇÃO MATEMÁTICA (Fatia os 20 itens certos)
  const totalPages = Math.ceil(categoryFilteredProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return categoryFilteredProducts.slice(start, end);
  }, [categoryFilteredProducts, currentPage]);

  // Reseta estados auxiliares ao alternar de categoria
  const handleCategoryView = (cat) => {
    setViewCategory(cat);
    setFilterSub("Todos");
    setFilterPromo(false);
    setCurrentPage(1);
    setSearch("");
  };

  const handleAdd = useCallback(
    (product) => {
      cart.add(product);
      toast.show(`🛒 ${product.nome} adicionado!`, "info");
    },
    [cart, toast]
  );

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <ToastContainer toasts={toast.toasts} />
      
      <Header 
        cartCount={cart.totalItems} 
        onCartOpen={() => setCartOpen(true)} 
        searchValue={search}
        onSearchChange={(val) => { setSearch(val); setViewCategory(null); }}
      />

      {/* Drawer & Modais */}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} />}
      {modalProduct && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} onAdd={(p) => { handleAdd(p); setModalProduct(null); }} />
      )}
      <FloatingCart totalItems={cart.totalItems} totalPrice={cart.totalPrice} onOpen={() => setCartOpen(true)} />

      <HeroBanner />

      <main style={{
        maxWidth: "var(--max-w)",
        margin:   "0 auto",
        padding:  "var(--space-6) var(--space-5) calc(var(--space-16) + 40px)",
      }}>

        {/* ============================================================
            CENA A: MODO BUSCA
           ============================================================ */}
        {search.trim() && (
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 600, color: "var(--purple-deep)" }}>
              Resultados para "{search}" ({searchFilteredProducts.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
              {searchFilteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} onOpenModal={setModalProduct} />
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            CENA B: SEÇÃO DETALHADA COM REFINAMENTO DA AMAZON + PAGINAÇÃO
           ============================================================ */}
        {!search.trim() && viewCategory && (
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            
            {/* Topbar de Título */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--lilac-soft)", paddingBottom: "var(--space-2)" }}>
              <button onClick={() => setViewCategory(null)} style={{ background: "var(--lilac-pale)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-main)", fontWeight: "bold" }}>
                ←
              </button>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--purple-deep)", textTransform: "capitalize" }}>
                {viewCategory.toLowerCase()}
              </h2>
              <span style={{ fontSize: ".8rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                {categoryFilteredProducts.length} itens encontrados
              </span>
            </div>

            {/* 🌪️ PAINEL DE FILTROS REFINADOS (ESTILO AMAZON) */}
            <div style={{ 
              background: "var(--surface)", 
              padding: "var(--space-4)", 
              borderRadius: "var(--radius-lg)", 
              border: "1px solid var(--border)", 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "var(--space-4)", 
              alignItems: "center" 
            }}>
              {/* Filtro de Subcategoria */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--purple-mid)", textTransform: "uppercase" }}>Tipo de Produto</span>
                <select 
                  value={filterSub} 
                  onChange={(e) => { setFilterSub(e.target.value); setCurrentPage(1); }}
                  style={{ padding: "6px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: "#fff", color: "var(--purple-deep)", outline: "none", fontSize: ".85rem" }}
                >
                  {currentSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Filtro de Ofertas */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", fontWeight: 600, color: "var(--purple-deep)", cursor: "pointer", marginTop: 16 }}>
                <input 
                  type="checkbox" 
                  checked={filterPromo} 
                  onChange={(e) => { setFilterPromo(e.target.checked); setCurrentPage(1); }}
                  style={{ width: 16, height: 16, accentColor: "var(--purple-main)" }}
                />
                🏷️ Ver apenas Ofertas / Promoções
              </label>
            </div>
            
            {/* GRID PRINCIPAL DA PÁGINA */}
            {paginatedProducts.length === 0 ? (
              <p style={{ textClassName: "center", padding: "var(--space-12)", color: "var(--text-muted)", textAlign: "center" }}>Nenhum item corresponde aos filtros selecionados. ➔</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--space-5)" }}>
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={handleAdd} onOpenModal={setModalProduct} />
                ))}
              </div>
            )}

            {/* 📑 NAVEGADOR DE PÁGINAS COM SETAS (1, 2, 3...) */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: "var(--space-8)" }}>
                {/* Seta Esquerda */}
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: currentPage === 1 ? "var(--surface-2)" : "#fff", color: "var(--purple-main)", cursor: currentPage === 1 ? "default" : "pointer", fontWeight: "bold" }}
                >
                  &lt;
                </button>

                {/* Números Centrais */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "var(--radius-md)",
                        border: "none",
                        background: currentPage === pageNum ? "linear-gradient(135deg, var(--purple-main), var(--purple-mid))" : "var(--lilac-pale)",
                        color: currentPage === pageNum ? "#fff" : "var(--purple-deep)",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Seta Direita */}
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-purple)", background: currentPage === totalPages ? "var(--surface-2)" : "#fff", color: "var(--purple-main)", cursor: currentPage === totalPages ? "default" : "pointer", fontWeight: "bold" }}
                >
                  &gt;
                </button>
              </div>
            )}

          </section>
        )}

        {/* ============================================================
            CENA C: SEÇÕES HORIZONTAIS COM LIMITE DE 12 ITENS NO CARROSSEL
           ============================================================ */}
        {!search.trim() && !viewCategory && !loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-10)" }}>
            {categories.map((category) => {
              const categoryProducts = products.filter(p => p.categoria === category);
              const carouselItems = categoryProducts.slice(0, 12);

              return (
                <section key={category} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--lilac-soft)", paddingBottom: 6 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 700, color: "var(--purple-deep)", textTransform: "capitalize" }}>
                      {category.toLowerCase()}
                    </h2>
                    <button 
                      onClick={() => handleCategoryView(category)}
                      style={{ background: "none", border: "none", color: "var(--purple-main)", fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}
                    >
                      Ver todos ({categoryProducts.length}) ➔
                    </button>
                  </div>

                  <div style={{
                    display: "flex",
                    gap: "var(--space-4)",
                    overflowX: "auto",
                    paddingBottom: "var(--space-4)",
                    paddingTop: 4,
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch"
                  }}>
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
      </main>

      <Footer />
    </div>
  );
}