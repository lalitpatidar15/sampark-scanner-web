"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useScannerAuth } from "@/lib/auth";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const { requestOtp, verifyOtp, user, ready, error } = useScannerAuth();
  const router = useRouter();

  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [stage, setStage] = React.useState<"phone" | "code">("phone");
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setLocalError(null);
    setNotice(null);
    try {
      const result = await requestOtp(phone);
      setStage("code");
      setNotice(
        result.devCode
          ? `Local mock provider: your code is ${result.devCode}`
          : `Code sent. You can request another in ${result.resendAfterSeconds}s.`,
      );
      if (result.devCode) setCode(result.devCode);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not send a code");
    } finally {
      setBusy(false);
    }
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setLocalError(null);
    try {
      await verifyOtp(phone, code);
      router.replace("/dashboard");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-brand-100 rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sampark Admin</h1>
          <p className="text-slate-600">Sign in to manage your tags and assets</p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
            {error}
          </p>
        )}
        {localError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-4">
            {localError}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 mb-6">
            {notice}
          </p>
        )}

        <form onSubmit={stage === "phone" ? sendCode : signIn} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              autoComplete="off"
            />
          </div>

          {stage === "code" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                6-digit code
              </label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                autoComplete="off"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 px-4 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
          >
            {busy ? "Processing…" : stage === "phone" ? "Send Code" : "Sign In"}
          </button>

          {stage === "code" && (
            <button
              type="button"
              onClick={() => setStage("phone")}
              className="w-full py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors"
              disabled={busy}
            >
              Back to phone entry
            </button>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account? Sign up using the mobile app first, then sign in
          here.
        </p>
      </div>
    </div>
  );
}
