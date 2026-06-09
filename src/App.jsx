// ============================================================
//  TAKEO PERFUMARIA — App.jsx
//  Orquestrador principal: dados, filtros em cascata, modais
// ============================================================
import { useState, useEffect, useCallback, useMemo } from "react";

// Importações corretas a partir do seu arquivo utils.js na raiz
import { CONFIG, parseProduct} from "./utils/formatters.js";
import {useCart} from"./Hooks/useCart.js";
import {useToast} from"./Hooks/useToast.js";

// Componentes localizados na sua pasta ./components/
import Header           from "./assets/components/Header.jsx";
import { Icons }        from "./assets/components/Icons.jsx";
import ProductCard      from "./assets/components/features/Catalog/components/ProductCard.jsx";
import ProductModal     from "./assets/components/features/Catalog/components/ProductModal.jsx";
import FeaturedCarousel from "./assets/components/features/Catalog/components/FeaturedCarousel.jsx";
import FilterBar        from "./assets/components/features/Catalog/components/FilterBar.jsx";
import CartDrawer       from "./assets/components/features/Cart/CartDrawer.jsx";
import HeroBanner       from "./assets/components/features/Catalog/HeroBanner.jsx"; // <-- Banner importado corretamente aqui!
import { FloatingCart} from "./assets/components/features/Cart/FloatingCart.jsx";
import { ToastContainer } from "./assets/components/features/Cart/FloatingCart.jsx";
// ── Skeleton de produto ─────────────────────────────────────
function ProductSkeleton() {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div className="skeleton" style={{ height: 11, width: "40%" }} />
        <div className="skeleton" style={{ height: 18, width: "80%" }} />
        <div className="skeleton" style={{ height: 11, width: "60%" }} />
        <div className="skeleton" style={{ height: 38 }} />
      </div>
    </div>
  );
}

// ── App ─────────────────────────────────────────────────────
export default function App() {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [cartOpen,       setCartOpen]       = useState(false);
  const [modalProduct,   setModalProduct]   = useState(null);
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeSub,      setActiveSub]      = useState("");

  const cart  = useCart();
  const toast = useToast();

  // ── Fetch dados ──────────────────────────────────────────
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

  // ── Categorias dinâmicas ─────────────────────────────────
  const categories = useMemo(() => {
    const cats = products.map((p) => p.categoria);
    return [...new Set(cats)].sort();
  }, [products]);

  // ── Subcategorias em cascata ─────────────────────────────
  const subcategories = useMemo(() => {
    if (activeCategory === "Todos") return [];
    const subs = products
      .filter((p) => p.categoria === activeCategory && p.subcategoria)
      .map((p) => p.subcategoria);
    return [...new Set(subs)].sort();
  }, [products, activeCategory]);

  // Limpa subcategoria quando muda categoria
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveSub("");
    setSearch("");
  };

  const handleSubChange = (sub) => {
    setActiveSub(sub);
    setSearch("");
  };

  // ── Produtos filtrados ───────────────────────────────────
  const filtered = useMemo(() => {
    let result = products;

    if (activeCategory !== "Todos") {
      result = result.filter((p) => p.categoria === activeCategory);
    }
    if (activeSub) {
      result = result.filter((p) => p.subcategoria === activeSub);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.descricao_curta.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.subcategoria.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, activeCategory, activeSub, search]);

  // ── Produtos em destaque (carrossel) ─────────────────────
  const featured = useMemo(
    () => products.filter((p) => p.destaque && p.estoque > 0),
    [products]
  );

  const showCarousel =
    !search &&
    activeCategory === "Todos" &&
    !activeSub &&
    featured.length > 0;

  // ── Adicionar ao carrinho ────────────────────────────────
  const handleAdd = useCallback(
    (product) => {
      cart.add(product);
      toast.show(`🛒 ${product.nome} adicionado!`, "info");
    },
    [cart, toast]
  );

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>

      {/* Toasts */}
      <ToastContainer toasts={toast.toasts} />

      {/* Header */}
      <Header cartCount={cart.totalItems} onCartOpen={() => setCartOpen(true)} />

      {/* Drawer */}
      {cartOpen && (
        <CartDrawer cart={cart} onClose={() => setCartOpen(false)} />
      )}

      {/* Modal de detalhes */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAdd={(p) => { handleAdd(p); setModalProduct(null); }}
        />
      )}

      {/* Botão flutuante */}
      <FloatingCart
        totalItems={cart.totalItems}
        totalPrice={cart.totalPrice}
        onOpen={() => setCartOpen(true)}
      />

      {/* Hero (Componente Isolado) */}
      <HeroBanner count={products.length} />

      {/* Main */}
      <main style={{
        maxWidth: "var(--max-w)",
        margin:   "0 auto",
        padding:  "var(--space-8) var(--space-5) calc(var(--space-16) + 80px)",
      }}>

        {/* Carrossel destaques */}
        {showCarousel && (
          <FeaturedCarousel
            products={featured}
            onAdd={handleAdd}
            onOpenModal={setModalProduct}
          />
        )}

        {/* Filtros */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          subcategories={subcategories}
          activeSubcategory={activeSub}
          onSubcategoryChange={handleSubChange}
        />

        {/* Título da seção */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   "var(--space-5)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize:   "clamp(1.3rem, 4vw, 1.7rem)",
            fontWeight: 600,
            color:      "var(--purple-deep)",
          }}>
            {search
              ? `Resultados para "${search}"`
              : activeCategory === "Todos"
              ? "Todos os Produtos"
              : activeSub
              ? `${activeCategory} · ${activeSub}`
              : activeCategory}
          </h2>
          {!loading && filtered.length > 0 && (
            <span style={{ fontSize: ".78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
            </span>
          )}
        </div>

        {/* ── Estado: carregando ──────────────────── */}
        {loading && (
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap:                 "var(--space-5)",
          }}>
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        )}

        {/* ── Estado: erro ──────────────────────── */}
        {error && !loading && (
          <div style={{
            textAlign:       "center",
            padding:         "var(--space-16) var(--space-8)",
            display:         "flex",
            flexDirection:   "column",
            alignItems:      "center",
            gap:             "var(--space-4)",
          }}>
            <div style={{
              width:          72,
              height:         72,
              borderRadius:   "50%",
              background:     "#FEF2F2",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              color:          "#EF4444",
            }}>
              <Icons.AlertTriangle size={32} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--purple-deep)" }}>
              Não conseguimos carregar os produtos
            </h3>
            <p style={{ fontSize: ".85rem", color: "var(--text-secondary)", maxWidth: 380 }}>
              Verifique a <code>SHEETDB_URL</code> no arquivo <code>utils.js</code>.
            </p>
            <button
              onClick={fetchProducts}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "var(--space-2)",
                padding:      "var(--space-3) var(--space-6)",
                background:   "linear-gradient(135deg, var(--purple-main), var(--purple-mid))",
                color:        "#fff",
                fontWeight:   600,
                fontSize:     ".9rem",
                borderRadius: "var(--radius-full)",
                border:       "none",
                cursor:       "pointer",
              }}
            >
              <Icons.RefreshCw size={16} /> Tentar novamente
            </button>
          </div>
        )}

        {/* ── Estado: sem resultados ────────────── */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{
            textAlign:       "center",
            padding:         "var(--space-16) var(--space-8)",
            display:         "flex",
            flexDirection:   "column",
            alignItems:      "center",
            gap:             "var(--space-4)",
          }}>
            <div style={{ animation: "float 3s ease-in-out infinite" }}>
              <Icons.Perfume size={80} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--purple-deep)" }}>
              {products.length === 0 ? "Nenhum produto cadastrado ainda" : "Nenhum produto encontrado"}
            </h3>
            <p style={{ fontSize: ".85rem", color: "var(--text-secondary)", maxWidth: 360 }}>
              {search
                ? "Tente buscar outro termo ou explore as categorias."
                : "Adicione produtos na planilha e eles aparecerão aqui."}
            </p>
            {(search || activeCategory !== "Todos" || activeSub) && (
              <button
                onClick={() => { setSearch(""); setActiveCategory("Todos"); setActiveSub(""); }}
                style={{
                  padding:      "var(--space-3) var(--space-6)",
                  background:   "var(--lilac-pale)",
                  color:        "var(--purple-mid)",
                  fontWeight:   600,
                  fontSize:     ".88rem",
                  borderRadius: "var(--radius-full)",
                  border:         "1px solid var(--border-purple)",
                  cursor:       "pointer",
                }}
              >
                Ver todos os produtos
              </button>
            )}
          </div>
        )}

        {/* ── Grid de produtos ──────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display:             "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap:                 "var(--space-5)",
          }}>
            {filtered.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={handleAdd}
                onOpenModal={setModalProduct}
                style={{ animationDelay: `${Math.min(i, 9) * 0.055}s` }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background:  "var(--purple-deep)",
        color:       "rgba(233,213,255,.65)",
        textAlign:   "center",
        padding:     "var(--space-8) var(--space-5)",
        fontSize:    ".82rem",
        lineHeight:  1.8,
      }}>
        <p style={{
          fontFamily:   "var(--font-display)",
          fontSize:     "1.2rem",
          color:        "#fff",
          fontWeight:   600,
          marginBottom: "var(--space-2)",
        }}>
          🌸 {CONFIG.STORE_NAME}
        </p>
        <p>Fragrâncias & Cosméticos Premium</p>
        <p style={{ marginTop: "var(--space-3)", color: "rgba(233,213,255,.35)", fontSize: ".72rem" }}>
          Todos os preços em Real Brasileiro · Imagens meramente ilustrativas
        </p>
      </footer>
    </div>
  );
}