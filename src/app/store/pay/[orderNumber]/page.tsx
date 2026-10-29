"use client";

import { useEffect, useState } from "react";
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<any>(null);
  const [providerOrderId, setProviderOrderId] = useState<string | null>(null);
  const [keyId, setKeyId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"loading" | "pay" | "success" | "error">("loading");

  useEffect(() => {
    api
      .post<any>("/payments/create-order", { orderId: orderNumber })
      .then((res) => {
        const d = res.data;
        setProviderOrderId(d.providerOrderId);
        setKeyId(d.keyId);
        setAmount(d.amount);
        setStep("pay");
      })
      .catch((err) => {
        setError(err.message ?? "Failed to create payment order");
        setStep("error");
      });
  }, [orderNumber]);

  const pay = () => {
    if (!keyId || !providerOrderId || !amount) return;
    setBusy(true);

    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options: any = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Sampark",
        description: "Sampark QR Tag",
        order_id: providerOrderId,
        handler: async (response: any) => {
          try {
            const res = await api.post<any>("/payments/verify", {
              orderId: orderNumber,
              providerOrderId: response.razorpay_order_id,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            setStep("success");
            setOrder(res.data);
          } catch (err: any) {
            setError(err.message ?? "Payment verification failed");
            setStep("error");
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError("Payment cancelled");
            setStep("error");
          },
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => {
      setError("Failed to load payment SDK");
      setStep("error");
      setBusy(false);
    };
    document.body.appendChild(script);
  };

  const cod = async () => {
    setBusy(true);
    try {
      // Mark order as COD - create a pending payment without provider
      // For MVP, redirect to order confirmation; admin fulfils later
      router.push(`/store/order/${orderNumber}`);
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Preparing payment…</p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-sm bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Payment error</h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/store/pay/${orderNumber}`)}
            className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment successful</h2>
          <p className="text-slate-600 mb-6">Your Sampark tag order is confirmed.</p>
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <p className="text-sm font-semibold text-slate-900">Order Number</p>
            <p className="font-mono text-sm">{orderNumber}</p>
          </div>
          <Link href={`/store/order/${orderNumber}`}>
            <button className="w-full py-4 px-6 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700">
              Track Order
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pay for your tag</h2>
          <p className="text-slate-600 mb-6">Order #{orderNumber}</p>

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-600">Amount payable</p>
            <p className="text-xl font-bold">
              ₹{(amount ?? 0 / 100).toFixed(2)}
            </p>
          </div>

          <button
            onClick={pay}
            disabled={busy}
            className="w-full py-4 px-6 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors mb-4"
          >
            {busy ? "Opening payment…" : "Pay with Razorpay (UPI / Card / Netbanking)"}
          </button>

          <hr className="my-6" />

          <p className="text-sm text-slate-600 mb-3">Prefer to pay on delivery?</p>
          <button
            onClick={cod}
            disabled={busy}
            className="w-full py-4 px-6 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cash on Delivery
          </button>
        </div>
      </div>
    </div>
  );
}
