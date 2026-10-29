"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function ETagPage() {
  const params = useParams();
  const router = useRouter();
  const tagId = params.tagId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eTagHtml, setETagHtml] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    generateETag();
  }, [tagId]);

  const generateETag = async () => {
    try {
      setGenerating(true);
      const result = await api.post<{ html: string; qrCodeDataUrl: string; publicToken: string }>(
        `/tags/${tagId}/etag/generate`,
        { format: "html" }
      );
      setETagHtml(result.data.html);
      setQrCodeDataUrl(result.data.qrCodeDataUrl);
      setPublicToken(result.data.publicToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate eTag");
    } finally {
      setGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!eTagHtml) return;
    const email = prompt("Enter email address:");
    if (!email) return;

    setSending("email");
    try {
      await api.post(`/tags/${tagId}/etag/send`, { channel: "email", recipient: email, format: "html" });
      alert("eTag sent via email!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(null);
    }
  };

  const sendWhatsApp = async () => {
    if (!eTagHtml) return;
    const phone = prompt("Enter phone number (with country code):");
    if (!phone) return;

    setSending("whatsapp");
    try {
      await api.post(`/tags/${tagId}/etag/send`, { channel: "whatsapp", recipient: phone, format: "html" });
      alert("eTag sent via WhatsApp!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send WhatsApp");
    } finally {
      setSending(null);
    }
  };

  const downloadHTML = () => {
    if (!eTagHtml) return;
    const blob = new Blob([eTagHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etag-${tagId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading eTag…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to load eTag</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/tags")}>Back to Tags</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <Card variant="elevated">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17a4 4 0 01-4-4v-2a2 2 0 012-2h2a2 2 0 012 2v2a4 4 0 01-4 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Digital eTag</h2>
            <p className="text-slate-500">Save as image, PDF, or share via WhatsApp/Email</p>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {qrCodeDataUrl && (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-3 rounded-lg shadow-sm" />
                <p className="text-sm font-mono text-slate-600 break-all">{publicToken}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full" onClick={downloadHTML} disabled={generating}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download HTML
              </Button>
              <Button variant="secondary" className="w-full" onClick={sendEmail} disabled={sending === "email"}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {sending === "email" ? "Sending…" : "Send Email"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" className="w-full" onClick={sendWhatsApp} disabled={sending === "whatsapp"}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.454.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-.47-2.55 9.88 9.88 0 013.67-6.077 9.87 9.87 0 016.254 1.444 9.87 9.87 0 012.084 7.47 9.88 9.88 0 01-5.977 4.075 9.87 9.87 0 01-1.628-.841c-.063-.08-.148-.17-.257-.253" />
                </svg>
                {sending === "whatsapp" ? "Sending…" : "Send WhatsApp"}
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => window.print()}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save PDF
              </Button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Use &ldquo;Print / Save PDF&rdquo; to save as PDF. On mobile, use &ldquo;Share&rdquo; &rarr; &ldquo;Save to Files&rdquo; or &ldquo;Add to Home Screen&rdquo; for quick access.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Your phone number and identity are never shared with anyone who scans this eTag.
        </p>
      </div>
    </div>
  );
}