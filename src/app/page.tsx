"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, type TagView } from "@/lib/api";
import { NFCScannerButton } from "@/components/NFCScanner";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      router.replace(`/t/${token}`);
    } else {
      setLoading(false);
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading Sampark…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-brand-100 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sampark</h1>
        <p className="text-slate-500 mb-6">Privacy-preserving contact platform. Scan a Sampark QR code to get started.</p>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600 mb-4">No QR code? Use the camera to scan one.</p>
          <div className="space-y-2">
            <button className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
              Open Camera
            </button>
            <button className="w-full py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              Upload Image
            </button>
            <NFCScannerButton
              onScan={(url) => {
                const match = url.match(/\/t\/([^/?]+)/);
                if (match) router.push(`/t/${match[1]}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}