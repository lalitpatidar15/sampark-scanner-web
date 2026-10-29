"use client";

import { useEffect, useRef, useState } from "react";

export function Turnstile({ siteKey, onVerify, theme = "light" }: { siteKey: string; onVerify: (token: string) => void; theme?: "light" | "dark" }) {
  const widgetIdRef = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).turnstile) {
      setLoaded(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetIdRef.current) return;

    widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      callback: (token: string) => {
        onVerify(token);
      },
      "expired-callback": () => {
        onVerify("");
      },
      "error-callback": () => {
        onVerify("");
      },
    });
  }, [loaded, siteKey, theme, onVerify]);

  const reset = () => {
    if (widgetIdRef.current !== null) {
      (window as any).turnstile.reset(widgetIdRef.current);
    }
  };

  const remove = () => {
    if (widgetIdRef.current !== null) {
      (window as any).turnstile.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    }
  };

  return (
    <div ref={containerRef} className="cf-turnstile" />
  );
}

export function useTurnstile(siteKey: string) {
  const [token, setToken] = useState<string>("");
  const [verified, setVerified] = useState(false);

  const onVerify = (t: string) => {
    setToken(t);
    setVerified(!!t);
  };

  return { token, verified, onVerify, siteKey };
}