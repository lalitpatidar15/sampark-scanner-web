"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type LocationShare } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function LocationSharePage() {
  const params = useParams();
  const router = useRouter();
  const shareToken = params.shareToken as string;

  const [location, setLocation] = useState<LocationShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocation() {
      try {
        const result = await api.get<LocationShare>(`/location-share/${shareToken}`);
        setLocation(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load location");
      } finally {
        setLoading(false);
      }
    }
    loadLocation();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading location…</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Location unavailable</h2>
          <p className="text-slate-500 mb-4">{error || "This location link has expired or is invalid."}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${location.latitude},${location.longitude}`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Shared Location</h2>
            <p className="text-slate-500">The owner has approved sharing this location with you</p>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div>
                  <p className="text-slate-500">Latitude</p>
                  <p className="font-medium text-slate-900 font-mono">{location.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Longitude</p>
                  <p className="font-medium text-slate-900 font-mono">{location.longitude.toFixed(6)}</p>
                </div>
                {location.accuracyMeters && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Accuracy</p>
                    <p className="font-medium text-slate-900">±{location.accuracyMeters} meters</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="primary" size="lg" onClick={() => window.open(mapsUrl, "_blank")}>
                  Open in Google Maps
                </Button>
                <Button variant="secondary" size="lg" onClick={() => window.open(appleMapsUrl, "_blank")}>
                  Open in Apple Maps
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                This link expires on <strong>{new Date(location.expiresAt).toLocaleString()}</strong>.
                After that, the location will no longer be accessible.
              </p>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => router.push("/")}>
              Done
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          This location was shared privately. It is not stored permanently.
        </p>
      </div>
    </div>
  );
}