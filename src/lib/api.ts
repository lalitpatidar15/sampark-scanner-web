/** API base for the scanner web app. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export interface TagView {
  tag: {
    publicTagId: string;
    tagType: string;
    status: string;
  };
  display: {
    assetType: string | null;
    displayName: string | null;
    make: string | null;
    model: string | null;
    color: string | null;
    registrationEnding: string | null;
  };
  channels: Record<string, boolean>;
  reasons: { code: string; label: string }[];
  owner: { displayName: string | null; businessHours: string | null };
}

export interface ScannerSession {
  id: string;
  sessionToken: string;
  expiresAt: string;
}

export interface CommunicationSessionView {
  sessionId: string;
  channel: string;
  status: string;
  expiresAt: string;
  relayNumber?: string;
  relayReference?: string;
  providerSessionId?: string;
  pollAfterSeconds: number;
}

export interface LocationShare {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  expiresAt: string;
}

export interface EmergencyResponse {
  alertId: string;
  status: string;
  ownerNotified: boolean;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-scanner-session": token } : {}),
      ...rest.headers,
    },
    cache: "no-store",
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string } }).error;
    throw new ApiError(
      error?.code ?? "UNKNOWN",
      error?.message ?? `Request failed with ${response.status}`,
      response.status,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: { token?: string }) => request<{ data: T }>(path, { method: "GET", ...options }),
  post: <T>(path: string, body?: unknown, options?: { token?: string }) =>
    request<{ data: T }>(path, { method: "POST", body: JSON.stringify(body ?? {}), ...options }),
};