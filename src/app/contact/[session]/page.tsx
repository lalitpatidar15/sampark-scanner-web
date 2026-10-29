"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type CommunicationSessionView } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

const CHANNEL_LABELS: Record<string, string> = {
  voice: "Private Call",
  sms: "SMS",
  whatsapp: "WhatsApp",
  chat: "Secure Message",
  video: "Video Call",
  emergency: "Emergency",
  locationShare: "Share Location",
};

export default function ContactPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.session as string;

  const [session, setSession] = useState<CommunicationSessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const result = await api.get<CommunicationSessionView>(`/s/${sessionToken}/status`);
        setSession(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Connecting…</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Session not found</h2>
          <p className="text-slate-500 mb-4">{error || "This session has expired or is invalid."}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const handleRedirect = () => {
    if (session.relayNumber) {
      // For voice calls, redirect to the call page
      router.push(`/call/${session.sessionId}`);
    } else {
      // For other channels, show success
      router.push("/success");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {CHANNEL_LABELS[session.channel] || session.channel}
            </h2>
            <p className="text-slate-500">Connecting you securely…</p>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-2">Session Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                session.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                session.status === "RINGING" ? "bg-yellow-100 text-yellow-700" :
                session.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-700"
              }`}>
                {session.status}
              </span>
            </div>

            {session.relayNumber && (
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                <p className="text-sm font-medium text-brand-700 mb-2">Dial this number</p>
                <p className="text-xl font-mono font-bold text-brand-900 break-all">{session.relayNumber}</p>
                <p className="text-xs text-brand-600 mt-2">This is a masked relay number. Your real number is never shared.</p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleRedirect}
              disabled={session.status === "COMPLETED" || session.status === "FAILED"}
            >
              {session.relayNumber ? "Open Dialer" : "Continue"}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Session expires in {Math.ceil((new Date(session.expiresAt).getTime() - Date.now()) / 60000)} minutes
        </p>
      </div>
    </div>
  );
}