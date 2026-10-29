"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function NfcResolvePage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [resolved, setResolved] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<any>(`/s/nfc/${encodeURIComponent(uid)}`)
      .then((result) => {
        const data = result.data ?? result;
        setResolved(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not read this NFC tag");
      })
      .finally(() => setLoading(false));
  }, [uid]);

  const openTag = () => {
    if (resolved?.publicToken) {
      router.push(`/t/${resolved.publicToken}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Reading NFC tag…</p>
        </div>
      </div>
    );
  }

  if (error || !resolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card>
          <CardHeader title="Could not read NFC tag" />
          <CardContent>
            <p className="text-sm text-slate-600">{error ?? "No tag information found for this NFC UID."}</p>
            <Button onClick={() => router.back()}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader title="NFC Tag" />
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tag ID</span>
              <span className="font-mono text-xs truncate">{resolved.tagId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Public Token</span>
              <span className="font-mono text-xs truncate">{resolved.publicToken ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Type</span>
              <span>{resolved.tagType ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className={resolved.status === "ACTIVE" ? "text-green-600" : "text-amber-600"}>{resolved.status ?? "—"}</span>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button onClick={openTag} disabled={!resolved.publicToken}>
              Open Tag Page
            </Button>
            <Button variant="ghost" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
