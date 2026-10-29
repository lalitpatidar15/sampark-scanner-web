"use client";

import { useEffect, useState } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  pricePaise: number;
  currency: string;
  active: boolean;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    api
      .get<Product[]>("/store/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading tags…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Unable to load tags</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sampark Tags</h1>
            <p className="text-slate-600">Privacy-preserving QR contact tags for your vehicle or asset.</p>
          </div>
          <Link
            href="/store/checkout"
            className="w-full md:w-auto py-3 px-6 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Buy a Tag
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/${product.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:border-brand-500 transition-colors flex flex-col"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-brand-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏷️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h3>
              <p className="text-sm text-slate-600 mb-3">{product.description ?? "A physical QR tag linked to your digital contact page."}</p>
              <div className="mt-auto pt-4 border-t border-slate-100">
                <span className="text-xl font-bold">{`₹${(product.pricePaise / 100).toFixed(2)}`}</span>
                <span className="ml-2 text-xs text-slate-500">one-time payment</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Each tag is a physical QR code linked to your private Sampark contact page. Scanners never see your
            real phone number — they contact you through a masked relay.
          </p>
        </div>
      </div>
    </div>
  );
}
