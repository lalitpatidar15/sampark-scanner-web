"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetTagQuery, useInitiateContactMutation } from "@/store/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";
import { Turnstile } from "@/components/Turnstile";

const REASON_LABELS: Record<string, string> = {
  VEHICLE_NEEDS_ATTENTION: "Vehicle needs attention",
  LIGHTS_ON: "Lights are ON",
  BLOCKING: "Vehicle is blocking",
  ACCIDENT_EMERGENCY: "Accident / Emergency",
  DELIVERY: "Delivery at the door",
  PROFESSIONAL_ENQUIRY: "Professional enquiry",
  PARKING_DISPUTE: "Parking dispute",
  OTHER: "Other",
};

const CHANNEL_LABELS: Record<string, string> = {
  voice: "Private Call",
  sms: "SMS",
  whatsapp: "WhatsApp",
  chat: "Secure Message",
  video: "Video Call",
  emergency: "Emergency",
  locationShare: "Share Location",
};

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const publicToken = params.publicToken as string;

  const { data: tagData, isLoading, error: tagError, refetch } = useGetTagQuery(publicToken);
  const [initiateContact, { isLoading: initiatingContact }] = useInitiateContactMutation();

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [initiating, setInitiating] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaChannel, setCaptchaChannel] = useState<string | null>(null);

  const tagView = tagData?.view;
  const session = tagData?.scannerSession;

  useEffect(() => {
    if (tagError) {
      const errorMessage = 'message' in tagError && tagError.message 
        ? tagError.message 
        : String(tagError);
      setError(errorMessage);
    }
  }, [tagError]);

  const handleContact = async (channel: string) => {
    if (!selectedReason) {
      setError("Please select a reason first");
      return;
    }
    if (!session) return;

    // High-risk actions require captcha
    const highRiskChannels = ["voice", "video"];
    if (highRiskChannels.includes(channel)) {
      setShowCaptcha(true);
      setCaptchaChannel(channel);
      return;
    }

    setInitiating(channel);
    setError(null);

    try {
      const commSession = await initiateContact({
        sessionId: session.id,
        reasonCode: selectedReason,
        channel: channel.toUpperCase(),
      }).unwrap();

      switch (channel) {
        case "voice":
          router.push(`/call/${commSession.sessionId}`);
          break;
        case "video":
          router.push(`/video/${commSession.sessionId}`);
          break;
        case "chat":
          router.push(`/chat/${commSession.sessionId}`);
          break;
        case "emergency":
          router.push(`/emergency/${commSession.sessionId}`);
          break;
        case "locationShare":
          router.push(`/location-request/${commSession.sessionId}`);
          break;
        case "sms":
        case "whatsapp":
          router.push("/success");
          break;
        default:
          router.push("/success");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate contact");
    } finally {
      setInitiating(null);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    if (captchaChannel) {
      handleContact(captchaChannel);
    }
    setShowCaptcha(false);
    setCaptchaChannel(null);
  };

  const handleCaptchaExpire = () => {
    setShowCaptcha(false);
    setCaptchaChannel(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading tag…</p>
        </div>
      </div>
    );
  }

  if (tagError || !tagView || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Tag not found</h2>
          <p className="text-slate-500 mb-4">{error || (tagError ? ('message' in tagError && tagError.message ? tagError.message : String(tagError)) : "This code is not valid or has expired.")}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const availableChannels = Object.entries(tagView.channels)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        {/* Tag Card */}
        <Card variant="elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 01-2-2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    {tagView.display.displayName || "Sampark Tag"}
                  </h1>
                  <p className="text-xs text-slate-500 font-mono">{tagView.tag.publicTagId}</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Active
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {/* Vehicle/Asset Info */}
            {tagView.display.assetType && (
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                  {tagView.display.assetType.replace(/_/g, " ")}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {tagView.display.make && (
                    <>
                      <span className="text-slate-500">Make</span>
                      <span className="font-medium text-slate-900">{tagView.display.make}</span>
                    </>
                  )}
                  {tagView.display.model && (
                    <>
                      <span className="text-slate-500">Model</span>
                      <span className="font-medium text-slate-900">{tagView.display.model}</span>
                    </>
                  )}
                  {tagView.display.color && (
                    <>
                      <span className="text-slate-500">Color</span>
                      <span className="font-medium text-slate-900">{tagView.display.color}</span>
                    </>
                  )}
                  {tagView.display.registrationEnding && (
                    <>
                      <span className="text-slate-500">Reg. ending</span>
                      <span className="font-medium text-slate-900 font-mono">{tagView.display.registrationEnding}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                How can we help?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tagView.reasons.map((reason: { code: string; label: string }) => (
                  <button
                    key={reason.code}
                    onClick={() => setSelectedReason(reason.code)}
                    className={`p-3 rounded-lg text-sm text-left transition-all ${
                      selectedReason === reason.code
                        ? "bg-brand-100 border-2 border-brand-500 text-brand-700"
                        : "bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50"
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Communication Options */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Choose contact method</p>
              <div className="grid gap-2">
                {availableChannels.map((channel) => (
                  <Button
                    key={channel}
                    variant={channel === "emergency" ? "danger" : "primary"}
                    size="lg"
                    className="w-full justify-start gap-3"
                    disabled={!selectedReason || initiating === channel}
                    onClick={() => handleContact(channel)}
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      {channel === "voice" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                      {channel === "sms" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2 2M8 12l2-2M20 12h-4m-4 0l-2 2m0 0l2-2M20 12h4M4 12h4m4 0l-2 2m0 0l2-2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                        </svg>
                      )}
                      {channel === "whatsapp" && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.454.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-.47-2.55 9.88 9.88 0 013.67-6.077 9.87 9.87 0 016.254 1.444 9.87 9.87 0 012.084 7.47 9.88 9.88 0 01-5.977 4.075 9.87 9.87 0 01-1.628-.841c-.063-.08-.148-.17-.257-.253" />
                        </svg>
                      )}
                      {channel === "chat" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2 2M8 12l2-2M20 12h-4m-4 0l-2 2m0 0l2-2M20 12h4M4 12h4m4 0l-2 2m0 0l2-2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                        </svg>
                      )}
                      {channel === "video" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                      {channel === "emergency" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      {channel === "locationShare" && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </span>
                    <span className="font-medium">{CHANNEL_LABELS[channel] || channel}</span>
                    {initiating === channel && (
                      <span className="ml-auto">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <p className="text-xs text-slate-500 text-center pt-2">
              Your phone number and identity are never shared with the owner.
            </p>
          </CardContent>
        </Card>

        {showCaptcha && (
          <Card variant="outlined" className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Security Check</h3>
              <p className="text-sm text-slate-600 mb-4">Please complete the captcha to proceed with the {captchaChannel === "voice" ? "voice call" : "video call"}.</p>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x0000000000000000000000000000000AA"}
                onVerify={handleCaptchaVerify}
              />
              <p className="text-xs text-slate-500 mt-4">Protected by Cloudflare Turnstile</p>
            </CardContent>
          </Card>
        )}

        {/* Info Footer */}
        <p className="text-center text-xs text-slate-400">
          Powered by Sampark — Privacy-preserving contact infrastructure
        </p>
      </div>
    </div>
  );
}