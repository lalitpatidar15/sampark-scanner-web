"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function LocationRequestPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.session as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function requestLocation() {
      try {
        const result = await api.post<{ requestId: string; status: string }>(
          `/s/${sessionToken}/location-request`,
          { reasonCode: "OTHER" }
        );
        setRequested(true);
        setRequestId(result.data.requestId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to request location");
      } finally {
        setLoading(false);
      }
    }
    requestLocation();
  }, [sessionToken]);

  const checkStatus = async () => {
    if (!requestId) return;
    try {
      const result = await api.get<{ status: string; shareId?: string; expiresAt?: string }>(
        `/s/${sessionToken}/location-request/${requestId}`
      );
      if (result.data.status === "APPROVED" && result.data.shareId) {
        router.push(`/location/${result.data.shareId}`);
      } else if (result.data.status === "DECLINED") {
        setError("The owner declined the location request");
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Requesting location…</p>
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Request failed</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (!requested) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Sending request…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Location Requested</h2>
            <p className="text-slate-500">The owner has been notified and will respond shortly</p>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                This request will expire in 5 minutes. The owner must approve it for you to see the location.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={checkStatus}
            >
              Check Status
            </Button>

            <Button variant="secondary" size="lg" className="w-full" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Your identity remains private. Only the location request is sent.
        </p>
      </div>
    </div>
  );
}