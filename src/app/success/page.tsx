"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

const CHANNEL_MESSAGES: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  voice: {
    title: "Call Initiated",
    description: "The owner has been notified. Dial the relay number to connect.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  sms: {
    title: "SMS Sent",
    description: "An SMS with a secure link has been sent to the owner.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2 2M8 12l2-2M20 12h-4m-4 0l-2 2m0 0l2-2M20 12h4M4 12h4m4 0l-2 2m0 0l2-2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
      </svg>
    ),
  },
  whatsapp: {
    title: "WhatsApp Sent",
    description: "A WhatsApp notification has been sent to the owner.",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.454.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-.47-2.55 9.88 9.88 0 013.67-6.077 9.87 9.87 0 016.254 1.444 9.87 9.87 0 012.084 7.47 9.88 9.88 0 01-5.977 4.075 9.87 9.87 0 01-1.628-.841c-.063-.08-.148-.17-.257-.253" />
      </svg>
    ),
  },
  chat: {
    title: "Chat Started",
    description: "A secure chat session has been created. The owner can now reply.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2 2M8 12l2-2M20 12h-4m-4 0l-2 2m0 0l2-2M20 12h4M4 12h4m4 0l-2 2m0 0l2-2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
      </svg>
    ),
  },
  locationShare: {
    title: "Location Requested",
    description: "The owner has been asked to share their location.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  default: {
    title: "Contact Sent",
    description: "The owner has been notified. They will respond shortly.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const channel = searchParams.get("channel") || "default";
  const message = CHANNEL_MESSAGES[channel] || CHANNEL_MESSAGES.default;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <Card variant="elevated" className="p-8">
          <div className="w-20 h-20 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{message.title}</h2>
          <p className="text-slate-500 mb-6">{message.description}</p>

          <div className="bg-slate-50 rounded-xl p-5 mb-6">
            <div className="text-brand-600 mb-3">{message.icon}</div>
            <p className="text-sm text-slate-600">Your privacy is protected — your phone number and identity are never shared.</p>
          </div>

          <Button size="lg" className="w-full mb-3" onClick={() => router.push("/")}>
            Done
          </Button>

          <Button variant="ghost" size="lg" className="w-full" onClick={() => router.back()}>
            Back
          </Button>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by Sampark — Privacy-preserving contact infrastructure
        </p>
      </div>
    </div>
  );
}