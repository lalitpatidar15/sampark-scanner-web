"use client";

import { useEffect, useState } from "react";
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  items: Array<{
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    total: number;
    tagSerial: string | null;
  }>;
  address: {
    name: string;
    phone: string;
    addressLines: string;
    city: string;
    state: string;
    postalCode: string;
  } | null;
  payments: Array<{ provider: string; status: string; amount: number }>;
  shipments: Array<{ carrier: string; trackingNumber: string | null; status: string }>;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Order>(`/api/orders/${orderNumber}`)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        setError(err.message ?? "Order not found");
      })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading order…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Order not found</h2>
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
              <p className="text-sm text-slate-600">
                Placed {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-slate-900">
                ₹{(order.total / 100).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">Order status</p>
              <p className="text-sm font-semibold">{order.status}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">Payment</p>
              <p className="text-sm font-semibold">{order.paymentStatus}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500 uppercase font-semibold">Items</p>
              <p className="text-sm font-semibold">{order.items.length}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Items</h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 text-slate-500">Product</th>
                  <th className="pb-2 text-slate-500 text-right">Qty</th>
                  <th className="pb-2 text-slate-500 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.productSku} className="border-b border-slate-100">
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">
                      ₹{(item.unitPrice / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {order.address && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Deliver to</h3>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <p className="font-medium">{order.address.name}</p>
                <p className="text-sm text-slate-600">{order.address.phone}</p>
                <p className="text-sm text-slate-600">{order.address.addressLines}</p>
                <p className="text-sm text-slate-600">
                  {order.address.city}, {order.address.state} - {order.address.postalCode}
                </p>
              </div>
            </div>
          )}

          {order.shipments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Shipment</h3>
              {order.shipments.map((s) => (
                <div key={s.carrier} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <p className="font-medium">{s.carrier}</p>
                  <p className="text-sm text-slate-600">Status: {s.status}</p>
                  {s.trackingNumber && (
                    <p className="text-sm text-slate-600">Tracking: {s.trackingNumber}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
