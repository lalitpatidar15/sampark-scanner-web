"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type EmergencyResponse } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function EmergencyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.session as string;

  const [result, setResult] = useState<EmergencyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    async function raiseEmergency() {
      try {
        const res = await api.post<EmergencyResponse>(`/s/${sessionToken}/emergency`, {
          reasonCode: "ACCIDENT_EMERGENCY",
        });
        setResult(res.data);
        setTriggered(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to raise emergency");
      } finally {
        setLoading(false);
      }
    }
    raiseEmergency();
  }, [sessionToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-red-600 font-medium">Raising emergency alert…</p>
          <p className="text-slate-500 text-sm mt-2">Notifying owner and priority contacts</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Emergency failed</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <Card variant="elevated" className="border-red-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-700 mb-1">Emergency Alert Sent</h2>
            <p className="text-slate-600">The owner and priority contacts have been notified</p>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-red-800">Owner notified immediately</p>
                  <p className="text-sm text-red-600">Priority contacts alerted via SMS</p>
                </div>
              </div>
            </div>

            {result && (
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <p className="text-slate-500 mb-1">Alert ID: <span className="font-mono text-slate-900">{result.alertId}</span></p>
                <p className="text-slate-500">Status: <span className="font-medium text-red-700">{result.status}</span></p>
                <p className="text-slate-500">Time: <span className="font-medium text-slate-900">{new Date(result.createdAt).toLocaleString()}</span></p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>If this is a life-threatening emergency, call 112 (India) or your local emergency number immediately.</strong>
              </p>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => router.push("/")}>
              Done
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Your identity remains private. Only the alert is shared.
        </p>
      </div>
    </div>
  );
}