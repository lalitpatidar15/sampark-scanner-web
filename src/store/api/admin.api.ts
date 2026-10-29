import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const adminApi = createApi({
  reducerPath: "adminApi",
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
  tagTypes: ["User", "Tag", "CommunicationSession", "EmergencyAlert", "AbuseReport", "AuditLog", "FeatureFlag", "QrSizeConfig"],
endpoints: (builder): Record<string, any> => {
    const endpoints = {
      // Dashboard
      getDashboard: builder.query<any, string>({
        query: (role) => `/admin/dashboard`,
      }),
      // Users
      listUsers: builder.query<any, { page?: number; limit?: number; status?: string }>({
        query: ({ page = 1, limit = 25, status }) => `/admin/users?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
        providesTags: ["User"],
      }),
      setUserStatus: builder.mutation<any, { userId: string; status: "ACTIVE" | "SUSPENDED"; reason: string }>({
        query: ({ userId, status, reason }) => ({
          url: `/admin/users/${userId}/status`,
          method: "POST",
          body: { status, reason },
        }),
        invalidatesTags: ["User"],
      }),
      // Tags
      listTagsAdmin: builder.query<any, { page?: number; limit?: number; status?: string }>({
        query: ({ page = 1, limit = 25, status }) => `/admin/tags?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
        providesTags: ["Tag"],
      }),
      suspendTag: builder.mutation<any, { tagId: string; reason: string }>({
        query: ({ tagId, reason }) => ({
          url: `/admin/tags/${tagId}/suspend`,
          method: "POST",
          body: { reason },
        }),
        invalidatesTags: ["Tag"],
      }),
      // Communications
      listCommunications: builder.query<any, { page?: number; limit?: number; channel?: string; status?: string }>({
        query: ({ page = 1, limit = 25, channel, status }) => `/admin/communications?page=${page}&limit=${limit}${channel ? `&channel=${channel}` : ""}${status ? `&status=${status}` : ""}`,
        providesTags: ["CommunicationSession"],
      }),
      // Emergency
      listEmergencies: builder.query<any, { page?: number; limit?: number; status?: string }>({
        query: ({ page = 1, limit = 25, status }) => `/admin/emergencies?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
        providesTags: ["EmergencyAlert"],
      }),
      resolveEmergency: builder.mutation<any, { alertId: string; note?: string }>({
        query: ({ alertId, note }) => ({
          url: `/admin/emergencies/${alertId}/resolve`,
          method: "POST",
          body: { note },
        }),
        invalidatesTags: ["EmergencyAlert"],
      }),
      // Abuse
      listAbuseReports: builder.query<any, { page?: number; limit?: number; state?: string }>({
        query: ({ page = 1, limit = 25, state }) => `/admin/abuse-reports?page=${page}&limit=${limit}${state ? `&state=${state}` : ""}`,
        providesTags: ["AbuseReport"],
      }),
      reviewAbuseReport: builder.mutation<any, { reportId: string; state: string; actionTaken?: string }>({
        query: ({ reportId, state, actionTaken }) => ({
          url: `/admin/abuse-reports/${reportId}/review`,
          method: "POST",
          body: { state, actionTaken },
        }),
        invalidatesTags: ["AbuseReport"],
      }),
      // Audit
      listAuditLogs: builder.query<any, { page?: number; limit?: number; action?: string }>({
        query: ({ page = 1, limit = 50, action }) => `/admin/audit-logs?page=${page}&limit=${limit}${action ? `&action=${encodeURIComponent(action)}` : ""}`,
        providesTags: ["AuditLog"],
      }),
      // Analytics
      getAnalytics: builder.query<any, { days?: number }>({
        query: ({ days = 30 }) => `/admin/analytics?days=${days}`,
      }),
      // Providers
      listProviders: builder.query<any[], void>({
        query: () => "/admin/providers",
      }),
      updateProvider: builder.mutation<any, { key: string; isActive: boolean; secretRef?: string }>({
        query: ({ key, isActive, secretRef }) => ({
          url: `/admin/providers/${key}`,
          method: "PATCH",
          body: { isActive, secretRef },
        }),
      }),
      // Feature flags
      listFeatureFlags: builder.query<any[], void>({
        query: () => "/admin/feature-flags",
        providesTags: ["FeatureFlag"],
      }),
      toggleFeatureFlag: builder.mutation<any, { key: string; enabled: boolean }>({
        query: ({ key, enabled }) => ({
          url: `/admin/feature-flags/${encodeURIComponent(key)}`,
          method: "PATCH",
          body: { enabled },
        }),
        invalidatesTags: ["FeatureFlag"],
      }),
      // QR Sizes
      listQrSizes: builder.query<any[], void>({
        query: () => "/admin/qr-sizes",
        providesTags: ["QrSizeConfig"],
      }),
      createQrSize: builder.mutation<any, { size: number; label: string; isActive?: boolean; sortOrder?: number; description?: string }>({
        query: (body) => ({
          url: "/admin/qr-sizes",
          method: "POST",
          body,
        }),
        invalidatesTags: ["QrSizeConfig"],
      }),
      updateQrSize: builder.mutation<any, { id: string; label?: string; isActive?: boolean; sortOrder?: number; description?: string }>({
        query: ({ id, ...body }) => ({
          url: `/admin/qr-sizes/${id}`,
          method: "PATCH",
          body,
        }),
        invalidatesTags: ["QrSizeConfig"],
      }),
      deleteQrSize: builder.mutation<void, string>({
        query: (id) => ({
          url: `/admin/qr-sizes/${id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["QrSizeConfig"],
      }),
      getActiveQrSizes: builder.query<any[], void>({
        query: () => "/admin/qr-sizes/active",
      }),
    };
    return endpoints;
  },
});

export const {
  useGetDashboardQuery,
  useListUsersQuery,
  useSetUserStatusMutation,
  useListTagsAdminQuery,
  useSuspendTagMutation,
  useListCommunicationsQuery,
  useListEmergenciesQuery,
  useResolveEmergencyMutation,
  useListAbuseReportsQuery,
  useReviewAbuseReportMutation,
  useListAuditLogsQuery,
  useGetAnalyticsQuery,
  useListProvidersQuery,
  useUpdateProviderMutation,
  useListFeatureFlagsQuery,
  useToggleFeatureFlagMutation,
  useListQrSizesQuery,
  useCreateQrSizeMutation,
  useUpdateQrSizeMutation,
  useDeleteQrSizeMutation,
  useGetActiveQrSizesQuery,
} = adminApi;