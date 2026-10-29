"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, type CommunicationSessionView } from "@/lib/api";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader } from "@/components/Card";

interface Message {
  id: string;
  senderType: "OWNER" | "SCANNER";
  body: string;
  createdAt: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session as string;

  const [session, setSession] = useState<CommunicationSessionView | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const result = await api.get<CommunicationSessionView>(`/s/chat/${sessionId}/status`);
        setSession(result.data);
        sessionTokenRef.current = result.data.sessionId; // Use sessionId as token for API calls
        await loadMessages();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chat");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const loadMessages = async () => {
    if (!sessionTokenRef.current) return;
    try {
      const result = await api.get<Message[]>(`/s/chat/${sessionId}/messages?token=${sessionTokenRef.current}`);
      setMessages(result.data);
    } catch {}
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionTokenRef.current || sending) return;
    setSending(true);
    try {
      await api.post(`/s/chat/${sessionId}/send`, { body: input.trim() }, { token: sessionTokenRef.current });
      setInput("");
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading chat…</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card variant="outlined" className="max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Chat unavailable</h2>
          <p className="text-slate-500 mb-4">{error || "This conversation has expired or is invalid."}</p>
          <Button variant="secondary" onClick={() => router.push("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="max-w-md mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <Card variant="elevated" className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2 2M8 12l2-2M20 12h-4m-4 0l-2 2m0 0l2-2M20 12h4M4 12h4m4 0l-2 2m0 0l2-2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Secure Chat</h2>
                <p className="text-xs text-slate-500">End-to-end encrypted • Auto-expires</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h4M8 12l2 2M8 12l2-2M20 12h-4m-4 0l-2 2m0 0l2-2M20 12h4M4 12h4m4 0l-2 2m0 0l2-2m-6-4h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                </svg>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === "SCANNER" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        msg.senderType === "SCANNER"
                          ? "bg-brand-600 text-white rounded-br-md"
                          : "bg-slate-100 text-slate-900 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{msg.body}</p>
                      <p className={`text-xs mt-1 ${msg.senderType === "SCANNER" ? "text-brand-100" : "text-slate-500"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                maxLength={2000}
              />
              <Button
                size="md"
                disabled={!input.trim() || sending}
                onClick={handleSend}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button variant="secondary" className="w-full mt-3" onClick={() => router.push("/")}>
          Done
        </Button>
      </div>
    </div>
  );
}