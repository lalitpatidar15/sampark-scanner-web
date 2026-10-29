"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type CommunicationSessionView } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session as string;

  const [session, setSession] = useState<CommunicationSessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callState, setCallState] = useState<"connecting" | "joining" | "connected" | "ended">("connecting");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([]);
  const [roomToken, setRoomToken] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const result = await api.get<CommunicationSessionView>(`/s/video/${sessionId}/status`);
        setSession(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load video session");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const initializePeerConnection = useCallback(() => {
    if (!iceServers.length) return null;

    const pc = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallState("connected");
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setCallState("ended");
      }
    };

    return pc;
  }, [iceServers]);

  const startCall = async () => {
    if (!session) return;
    setCallState("joining");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = initializePeerConnection();
      if (!pc) throw new Error("Failed to create peer connection");

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const result = await api.post<{ roomId: string; roomToken: string; iceServers: RTCIceServer[] }>(
        `/video/join`,
        { roomId: session.providerSessionId || sessionId, roomToken: session.relayReference || "" }
      );

      setRoomId(result.data.roomId);
      setRoomToken(result.data.roomToken);
      setIceServers(result.data.iceServers);

      setCallState("connected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start video call");
      setCallState("ended");
    }
  };

  const endCall = async () => {
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    try {
      await api.post(`/video/leave`, { roomId });
    } catch {}

    setCallState("ended");
    setLocalStream(null);
    setRemoteStream(null);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
  };

  useEffect(() => {
    if (callState === "connected") {
      durationIntervalRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [callState]);

  useEffect(() => {
    if (session && callState === "connecting") {
      startCall();
    }
  }, [session, callState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading video call…</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Call failed</h2>
          <p className="text-slate-500 mb-4">{error || "Unable to establish video call."}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
          {remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "rotateY(180deg)" }}
            />
          )}
          {!remoteStream && callState !== "ended" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center text-slate-400">
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Connecting to owner…</p>
                <p className="text-sm mt-2">Waiting for owner to answer</p>
              </div>
            </div>
          )}
          {callState === "ended" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <p className="text-lg font-medium">Call Ended</p>
                <p className="text-sm mt-1">Duration: {formatTime(duration)}</p>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              callState === "connected" ? "bg-green-600" :
              callState === "joining" ? "bg-yellow-600" :
              "bg-slate-600"
            }`}>
              {callState === "connected" && `● Live • ${formatTime(duration)}`}
              {callState === "joining" && "● Connecting…"}
              {callState === "connecting" && "● Starting…"}
              {callState === "ended" && "● Ended"}
            </span>
          </div>

          {localStream && callState !== "ended" && (
            <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-slate-700" style={{ transform: "rotateY(180deg)" }}>
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <Card variant="elevated" className="bg-slate-800 border-slate-700">
          <CardContent className="pt-4 pb-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant={localStream?.getAudioTracks()[0]?.enabled ? "secondary" : "danger"}
                size="lg"
                className="w-14 h-14 rounded-full p-0"
                onClick={() => {
                  const track = localStream?.getAudioTracks()[0];
                  if (track) track.enabled = !track.enabled;
                }}
                disabled={callState === "ended"}
              >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {localStream?.getAudioTracks()[0]?.enabled ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 013-3h6a3 3 0 013 3v6a3 3 0 01-3 3z" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </>
                  )}
                </svg>
              </Button>

              <Button
                variant={localStream?.getVideoTracks()[0]?.enabled ? "secondary" : "danger"}
                size="lg"
                className="w-14 h-14 rounded-full p-0"
                onClick={() => {
                  const track = localStream?.getVideoTracks()[0];
                  if (track) track.enabled = !track.enabled;
                }}
                disabled={callState === "ended"}
              >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {localStream?.getVideoTracks()[0]?.enabled ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                    </>
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l-4-4" />
                    </>
                  )}
                </svg>
              </Button>

              <Button
                variant="danger"
                size="lg"
                className="w-14 h-14 rounded-full p-0 bg-red-600 hover:bg-red-700"
                onClick={endCall}
                disabled={callState === "ended"}
              >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-14 h-14 rounded-full p-0"
                onClick={async () => {
                  try {
                    const newStream = await navigator.mediaDevices.getUserMedia({
                      video: { facingMode: localStream?.getVideoTracks()[0]?.getSettings().facingMode === "user" ? "environment" : "user" },
                      audio: false,
                    });
                    const videoTrack = newStream.getVideoTracks()[0];
                    const sender = peerConnectionRef.current?.getSenders().find((s) => s.track?.kind === "video");
                    if (sender) await sender.replaceTrack(videoTrack);
                    localStream?.getVideoTracks()[0]?.stop();
                    localStream?.removeTrack(localStream.getVideoTracks()[0]);
                    localStream?.addTrack(videoTrack);
                    setLocalStream(new MediaStream([...localStream!.getAudioTracks(), videoTrack]));
                  } catch {}
                }}
                disabled={callState === "ended" || callState !== "connected"}
              >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        {callState === "ended" && (
          <Button variant="secondary" className="w-full max-w-md mx-auto" onClick={() => router.push("/")}>
            Done
          </Button>
        )}

        <p className="text-center text-xs text-slate-400 max-w-md mx-auto">
          Your video is end-to-end encrypted. No recordings are stored.
        </p>
      </div>
    </div>
  );
}