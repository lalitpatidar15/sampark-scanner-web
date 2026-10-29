"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type CommunicationSessionView } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session as string;

  const [session, setSession] = useState<CommunicationSessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    async function loadSession() {
      try {
        const result = await api.get<CommunicationSessionView>(`/s/call/${sessionId}/status`);
        setSession(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load call session");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  // Poll for call status
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(async () => {
      try {
        const result = await api.get<CommunicationSessionView>(`/s/call/${sessionId}/status`);
        setSession(result.data);
        if (result.data.status === "COMPLETED" || result.data.status === "FAILED") {
          setCallStatus("ended");
          clearInterval(interval);
        } else if (result.data.status === "RINGING") {
          setCallStatus("ringing");
        } else if (result.data.status === "ACTIVE") {
          setCallStatus("connected");
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId, session]);

  // Duration timer
  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Connecting call…</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Call failed</h2>
          <p className="text-slate-500 mb-4">{error || "Unable to establish call."}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              callStatus === "connected" ? "bg-green-100" :
              callStatus === "ringing" ? "bg-yellow-100 animate-pulse" :
              "bg-brand-100"
            }`}>
              <svg className={`w-10 h-10 ${callStatus === "connected" ? "text-green-600" : callStatus === "ringing" ? "text-yellow-600" : "text-brand-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Private Call</h2>
            <p className="text-slate-500">
              {callStatus === "connecting" && "Connecting…"}
              {callStatus === "ringing" && "Ringing…"}
              {callStatus === "connected" && `Connected — ${formatTime(duration)}`}
              {callStatus === "ended" && "Call ended"}
            </p>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {session.relayNumber && callStatus !== "ended" && (
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-brand-700 mb-2">Dial this number</p>
                <p className="text-2xl font-mono font-bold text-brand-900 break-all">{session.relayNumber}</p>
                <p className="text-xs text-brand-600 mt-2">Masked relay — your number is private</p>
              </div>
            )}

            {callStatus === "connected" && (
              <Button
                variant="danger"
                size="lg"
                className="w-full h-16 text-lg"
                onClick={async () => {
                  try {
                    await api.post(`/s/call/${sessionId}/end`);
                    setCallStatus("ended");
                  } catch {}
                }}
              >
                End Call
              </Button>
            )}

            {callStatus === "ended" && (
              <Button variant="secondary" size="lg" className="w-full" onClick={() => router.push("/success")}>
                Done
              </Button>
            )}

            <p className="text-center text-xs text-slate-500">
              Maximum call duration: 5 minutes
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Your phone number is never revealed to the owner
        </p>
      </div>
    </div>
  );
}