import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const scannerApi = createApi({
  reducerPath: "scannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ["ScannerSession", "CommunicationSession", "LocationShare", "EmergencyAlert"],
  endpoints: (builder) => ({
    scanQr: builder.query<{ view: any; scannerSession: any }, { publicToken: string }>({
      query: ({ publicToken }) => `/s/${publicToken}`,
    }),
    initiateContact: builder.mutation<any, { sessionId: string; reasonCode: string; channel: string }>({
      query: ({ sessionId, ...body }) => ({
        url: `/s/${sessionId}/contact`,
        method: "POST",
        body,
      }),
    }),
    getContactStatus: builder.query<any, string>({
      query: (sessionId) => `/s/${sessionId}/status`,
    }),
    endScannerSession: builder.mutation<void, string>({
      query: (sessionToken) => ({
        url: `/s/${sessionToken}/end`,
        method: "POST",
      }),
    }),
    // Chat
    getChatMessages: builder.query<any[], { sessionId: string; token?: string }>({
      query: ({ sessionId, token }) => `/s/chat/${sessionId}/messages${token ? `?token=${token}` : ""}`,
    }),
    sendChatMessage: builder.mutation<any, { sessionId: string; body: string; token?: string }>({
      query: ({ sessionId, body, token }) => ({
        url: `/s/chat/${sessionId}/send${token ? `?token=${token}` : ""}`,
        method: "POST",
        body: { body },
      }),
    }),
    // Emergency
    raiseEmergency: builder.mutation<any, { sessionToken: string; reasonCode: string }>({
      query: ({ sessionToken, reasonCode }) => ({
        url: `/s/${sessionToken}/emergency`,
        method: "POST",
        body: { reasonCode },
      }),
    }),
    // Location
    requestLocation: builder.mutation<any, { sessionToken: string; reasonCode?: string }>({
      query: ({ sessionToken, reasonCode }) => ({
        url: `/s/${sessionToken}/location-request`,
        method: "POST",
        body: { reasonCode },
      }),
    }),
    getLocationRequestStatus: builder.query<any, { sessionToken: string; requestId: string }>({
      query: ({ sessionToken, requestId }) => `/s/${sessionToken}/location-request/${requestId}`,
    }),
    getLocationShare: builder.query<any, string>({
      query: (shareToken) => `/location-share/${shareToken}`,
    }),
    // Video
    getVideoCallStatus: builder.query<any, string>({
      query: (sessionId) => `/s/video/${sessionId}/status`,
    }),
    endCall: builder.mutation<void, string>({
      query: (sessionId) => ({
        url: `/s/call/${sessionId}/end`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useScanQrQuery,
  useInitiateContactMutation,
  useGetContactStatusQuery,
  useEndScannerSessionMutation,
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useRaiseEmergencyMutation,
  useRequestLocationMutation,
  useGetLocationRequestStatusQuery,
  useGetLocationShareQuery,
  useGetVideoCallStatusQuery,
  useEndCallMutation,
} = scannerApi;