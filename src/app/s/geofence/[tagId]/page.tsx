"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function GeoFenceProximityPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.tagId as string;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const checkProximity = useCallback(
    async (latitude: number, longitude: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post<any>(
          `/s/geofence/${encodeURIComponent(tagId)}/proximity`,
          { latitude, longitude },
        );
        setResult(res.data ?? res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not check proximity");
      } finally {
        setLoading(false);
      }
    },
    [tagId],
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser");
      return;
    }

    // Single-shot check on mount.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        checkProximity(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setError(err.message ?? "Unable to access location");
        setLoading(false);
      },
      { enableHighAccuracy: true },
    );

    // Watch position so proximity updates as the user moves.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        checkProximity(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        // Watch errors are non-fatal; keep last known result.
        console.error("Geolocation watch error:", err);
      },
      { enableHighAccuracy: true },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [tagId, checkProximity]);

  if (loading && !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Checking your location…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader title="Geo-fence Proximity" />
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Your distance from this tag&apos;s geo-fence ({result ? result.distanceMeters : "—"} m vs {result ? result.radiusMeters : "—"} m radius).
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {result ? (
            <>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-500">Inside geofence</span>
                <span
                  className={`font-medium ${result.inside ? "text-green-600" : "text-slate-600"}`}
                >
                  {result.inside ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-500">Distance</span>
                <span className="font-mono">{result.distanceMeters}m</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-500">Cooldown elapsed</span>
                <span className={result.cooldownElapsed ? "text-green-600" : "text-amber-600"}>
                  {result.cooldownElapsed ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-slate-500">Allowed channels</span>
                <span>{(result.allowedChannels ?? []).join(", ") || "—"}</span>
              </div>
              {result.alertOnProximity && (
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-500">Alert on proximity</span>
                  <span className="text-amber-600">Enabled</span>
                </div>
              )}
              {result.inside && result.cooldownElapsed ? (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  You are inside the geo-fence and the cooldown has elapsed — proximity alerts are active.
                </div>
              ) : null}
            </>
          ) : null}

          <div className="mt-6 flex gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
