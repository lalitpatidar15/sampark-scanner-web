"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    addressLines: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const items = [{ productId: "placeholder-product-id", quantity: 1 }];

    try {
      const result = await api.post<any>("/store/checkout", {
        items,
        address: {
          name: form.name,
          phone: form.phone,
          addressLines: form.addressLines,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
        },
      });

      const order = result.data;
      router.push(`/store/pay/${order.orderNumber}`);
    } catch (err: any) {
      setError(err.message ?? "Failed to create order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Checkout</h2>
          <p className="text-slate-600 mb-6">Enter your delivery details to buy a Sampark tag.</p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address line 1</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  value={form.addressLines}
                  onChange={(e) => setForm({ ...form, addressLines: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address line 2</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input
                  className="w-full py-2 px-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 px-6 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
              >
                {busy ? "Creating order…" : "Continue to Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
