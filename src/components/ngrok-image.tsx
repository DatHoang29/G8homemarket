import React, { useState, useEffect } from "react";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='45%25' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E%F0%9F%9B%8D%3C/text%3E%3Ctext x='50%25' y='70%25' font-size='24' text-anchor='middle' fill='%239ca3af'%3ES%E1%BA%A3n ph%E1%BA%A9m%3C/text%3E%3C/svg%3E";

// Localhost dùng img src bình thường (tránh CORS khi dev)
// Production Zalo WebView dùng fetch+blob để bypass ngrok interstitial
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const isZaloMiniApp =
  typeof window !== "undefined" &&
  Boolean((window as any).ZJSBridge);

const addNgrokBypassQuery = (url: string) => {
  if (!url || !url.includes("ngrok")) return url;
  if (url.includes("ngrok-skip-browser-warning")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}ngrok-skip-browser-warning=true`;
};

interface NgrokImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export const NgrokImage: React.FC<NgrokImageProps> = ({ src, alt, className, style }) => {
  const [blobSrc, setBlobSrc] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const needsFetch = Boolean(src && src.includes("ngrok"));

    // Trên localhost và KHÔNG chạy trong Zalo Mini App: chỉ dùng img src trực tiếp cho URL không phải ngrok.
    // Nếu là ngrok thì luôn dùng fetch+blob để tránh ngrok interstitial / bị chặn trong simulator.
    if (isLocalhost && !isZaloMiniApp && !needsFetch) return;

    let objectUrl = "";

    // data URI: dùng trực tiếp
    if (!src || src.startsWith("data:")) {
      setBlobSrc(src || PLACEHOLDER);
      return;
    }

    const fetchImage = async () => {
      try {
        const url = addNgrokBypassQuery(src);
        const headers: Record<string, string> = {};
        if (url.includes("ngrok")) {
          headers["ngrok-skip-browser-warning"] = "true";
        }
        console.log("Fetching image via JS:", url);
        const res = await fetch(url, { headers });
        if (!res.ok) {
          console.warn("Image fetch failed, status:", res.status, url);
          setFailed(true);
          return;
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setBlobSrc(objectUrl);
      } catch (e) {
        console.warn("Image fetch error:", e, src);
        setFailed(true);
      }
    };

    fetchImage();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  // === Localhost (non-Zalo): img bình thường cho URL không phải ngrok ===
  if (isLocalhost && !isZaloMiniApp && !(src || "").includes("ngrok")) {
    const localSrc = src || PLACEHOLDER;
    return (
      <img
        src={localSrc}
        alt={alt}
        className={className}
        style={style}
        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
      />
    );
  }

  // === Production: dùng blob URL sau khi fetch ===
  if (failed) {
    return <img src={PLACEHOLDER} alt={alt} className={className} style={style} />;
  }

  if (!blobSrc && src.startsWith("data:")) {
    return <img src={src || PLACEHOLDER} alt={alt} className={className} style={style} />;
  }

  if (!blobSrc) {
    return (
      <div
        className={`${className} bg-gray-100 animate-pulse`}
        aria-label={alt}
        style={style}
      />
    );
  }

  return <img src={blobSrc} alt={alt} className={className} style={style} />;
};

