import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const emergencyApi = createApi({
  reducerPath: "emergencyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { accessToken: string | null } };
      const token = state.auth?.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["EmergencyContact", "EmergencyAlert"],
  endpoints: (builder) => ({
    listEmergencyContacts: builder.query<any[], void>({
      query: () => "/emergency/contacts",
      providesTags: ["EmergencyContact"],
    }),
    createEmergencyContact: builder.mutation<any, { name: string; relationship: string; phone: string; priority: number; enabled: boolean }>({
      query: (body) => ({
        url: "/emergency/contacts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
    updateEmergencyContact: builder.mutation<any, { contactId: string; body: Partial<any> }>({
      query: ({ contactId, body }) => ({
        url: `/emergency/contacts/${contactId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
    deleteEmergencyContact: builder.mutation<void, string>({
      query: (contactId) => ({
        url: `/emergency/contacts/${contactId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmergencyContact"],
    }),
    listEmergencyAlerts: builder.query<any[], void>({
      query: () => "/emergency/alerts",
      providesTags: ["EmergencyAlert"],
    }),
    // Scanner emergency
    raiseEmergency: builder.mutation<any, { sessionToken: string; reasonCode: string }>({
      query: ({ sessionToken, reasonCode }) => ({
        url: `/s/${sessionToken}/emergency`,
        method: "POST",
        body: { reasonCode },
      }),
    }),
  }),
});

export const {
  useListEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useUpdateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
  useListEmergencyAlertsQuery,
  useRaiseEmergencyMutation,
} = emergencyApi;