"use client";

import { useEffect, useState } from "react";
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
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

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Product>(`/store/products/${id}`)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        setError(err.message ?? "Product not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading tag…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Tag not found</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Link href="/store">
            <button className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700">
              Browse tags
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <Link href="/store" className="text-sm text-brand-600 hover:underline mb-6 inline-block">
        ← Back to tags
      </Link>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="w-48 h-48 bg-brand-50 rounded-xl flex items-center justify-center mx-auto md:mx-0">
                <span className="text-4xl">🏷️</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{product.name}</h3>
              <p className="text-slate-600 mb-6">{product.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{(product.pricePaise / 100).toFixed(2)}
                </span>
                <span className="ml-3 text-sm text-slate-500">one-time payment • physical delivery</span>
              </div>
              <Link
                href="/store/checkout"
                className="w-full py-4 px-6 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
