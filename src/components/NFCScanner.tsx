"use client";

import { useEffect, useRef, useState } from "react";

export interface NDEFMessage {
  records: NDEFRecord[];
}

export interface NDEFRecord {
  recordType: string;
  mediaType: string;
  data: DataView;
}

declare global {
  interface Navigator {
    nfc?: NFC;
  }
}

interface NFC {
  scan(options?: { signal?: AbortSignal }): Promise<NDEFMessage[]>;
}

export function useNFCScanner() {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "nfc" in navigator) {
      setIsSupported(true);
    }
  }, []);

  const startScan = async () => {
    if (!isSupported) {
      setError("NFC is not supported on this device/browser");
      return;
    }
    if (isScanning) return;

    setIsScanning(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const messages = await (navigator as any).nfc.scan({ signal: abortControllerRef.current.signal });
      for (const message of messages) {
        for (const record of message.records) {
          if (record.recordType === "url") {
            const decoder = new TextDecoder();
            const url = decoder.decode(record.data);
            if (url.includes("/t/") || url.includes("sampark")) {
              setLastScan(url);
              setIsScanning(false);
              return url;
            }
          } else if (record.recordType === "text") {
            const decoder = new TextDecoder();
            const text = decoder.decode(record.data);
            if (text.startsWith("sampark:") || text.includes("/t/")) {
              setLastScan(text);
              setIsScanning(false);
              return text;
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setIsScanning(false);
    }
    return null;
  };

  const stopScan = () => {
    abortControllerRef.current?.abort();
    setIsScanning(false);
  };

  return { isSupported, isScanning, error, lastScan, startScan, stopScan };
}

export function NFCScannerButton({ onScan }: { onScan: (url: string) => void }) {
  const { isSupported, isScanning, error, startScan } = useNFCScanner();

  if (!isSupported) return null;

  const handleClick = async () => {
    const url = await startScan();
    if (url) onScan(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isScanning}
      className="w-full py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      <span>{isScanning ? "Scanning…" : "Tap NFC Tag"}</span>
    </button>
  );
}