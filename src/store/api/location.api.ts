import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const locationApi = createApi({
  reducerPath: "locationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ["LocationShare"],
  endpoints: (builder) => ({
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
  }),
});

export const {
  useRequestLocationMutation,
  useGetLocationRequestStatusQuery,
  useGetLocationShareQuery,
} = locationApi;