"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  TAG_NOT_ACTIVE: {
    title: "Tag Not Active",
    description: "This tag has been deactivated or suspended. Please contact the owner directly if you have their information.",
  },
  TAG_INACTIVE: {
    title: "Tag Unavailable",
    description: "This tag is currently inactive. The owner may have disabled it temporarily.",
  },
  CHANNEL_DISABLED: {
    title: "Contact Method Unavailable",
    description: "The owner has not enabled this contact method. Please try another option.",
  },
  REAUTH_REQUIRED: {
    title: "Verification Required",
    description: "For security, please verify your phone number before making a call.",
  },
  RATE_LIMITED: {
    title: "Too Many Requests",
    description: "You've made too many attempts. Please wait a while before trying again.",
  },
  SESSION_EXPIRED: {
    title: "Session Expired",
    description: "Your session has expired. Please scan the QR code again.",
  },
  default: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try scanning the code again.",
  },
};

export default function ErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const code = searchParams.get("code") || "default";
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.default;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <Card variant="outlined" className="p-8 border-red-200">
          <div className="w-20 h-20 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{message.title}</h2>
          <p className="text-slate-500 mb-6">{message.description}</p>

          {code !== "SESSION_EXPIRED" && (
            <Button size="lg" className="w-full mb-3" onClick={() => router.push("/")}>
              Scan Another Code
            </Button>
          )}

          {code === "SESSION_EXPIRED" && (
            <Button size="lg" className="w-full mb-3" onClick={() => router.push("/")}>
              Start Over
            </Button>
          )}

          <Button variant="ghost" size="lg" className="w-full" onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-4">
          Error code: <code className="font-mono text-slate-600">{code}</code>
        </p>
      </div>
    </div>
  );
}