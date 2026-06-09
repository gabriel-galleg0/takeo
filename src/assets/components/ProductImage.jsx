// ============================================================
//  TAKEO PERFUMARIA — components/ProductImage.jsx
//  Imagem com skeleton de carregamento e fallback automático
// ============================================================
import { useState, useEffect } from "react";
import { CONFIG } from "../../utils/formatters";

export default function ProductImage({ src, alt, style, className }) {
  const [imgSrc, setImgSrc]   = useState(src || CONFIG.FALLBACK_IMAGE);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    setImgSrc(src || CONFIG.FALLBACK_IMAGE);
    setLoaded(false);
  }, [src]);

  return (
    <div style={{ position: "relative", overflow: "hidden", ...style }}>
      {!loaded && (
        <div
          className="skeleton"
          style={{ position: "absolute", inset: 0 }}
        />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        onLoad={() => setLoaded(true)}
        onError={() => { setImgSrc(CONFIG.FALLBACK_IMAGE); setLoaded(true); }}
        style={{
          opacity:    loaded ? 1 : 0,
          transition: "opacity 0.35s ease",
          width:      "100%",
          height:     "100%",
          objectFit:  "cover",
          display:    "block",
        }}
      />
    </div>
  );
}