import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const documentsApi = createApi({
  reducerPath: "documentsApi",
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
  tagTypes: ["Document"],
  endpoints: (builder) => ({
    getDocumentUploadUrl: builder.mutation<{ uploadUrl: string; objectKey: string }, { assetId: string; documentType: string; fileName: string; contentType: string; fileSize: number }>({
      query: (body) => ({
        url: "/documents/upload-url",
        method: "POST",
        body,
      }),
    }),
    createDocument: builder.mutation<any, { assetId: string; documentType: string; objectKey: string; originalName: string; fileSize: number; mimeType: string }>({
      query: (body) => ({
        url: "/documents",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Document"],
    }),
    listDocuments: builder.query<any[], { assetId?: string }>({
      query: ({ assetId }) => `/documents${assetId ? `?assetId=${assetId}` : ""}`,
      providesTags: ["Document"],
    }),
    getDocumentDownloadUrl: builder.mutation<{ downloadUrl: string; fileName: string }, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}/download`,
        method: "GET",
      }),
    }),
    deleteDocument: builder.mutation<void, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),
  }),
});

export const {
  useGetDocumentUploadUrlMutation,
  useCreateDocumentMutation,
  useListDocumentsQuery,
  useGetDocumentDownloadUrlMutation,
  useDeleteDocumentMutation,
} = documentsApi;