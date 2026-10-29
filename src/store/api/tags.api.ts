import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const tagsApi = createApi({
  reducerPath: "tagsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ["Tag", "Etag"],
  endpoints: (builder) => ({
    getTag: builder.query<{ view: any; scannerSession: any }, string>({
      query: (publicToken) => `/s/${publicToken}`,
      providesTags: (result, error, publicToken) => [{ type: "Tag", id: publicToken }],
    }),
    getTagPublicToken: builder.query<{ publicToken: string }, string>({
      query: (tagId) => `/tags/${tagId}/public-token`,
      providesTags: (result, error, tagId) => [{ type: "Tag", id: tagId }],
    }),
    generateEtag: builder.mutation<{ html: string; qrCodeDataUrl: string; publicToken: string }, { tagId: string; format: "html" | "pdf" | "png" }>({
      query: ({ tagId, format }) => ({
        url: `/tags/${tagId}/etag/generate`,
        method: "POST",
        body: { format },
      }),
      invalidatesTags: (result, error, { tagId }) => [{ type: "Etag", id: tagId }],
    }),
    sendEtag: builder.mutation<{ sent: true }, { tagId: string; channel: "email" | "whatsapp"; recipient: string; format: "html" | "pdf" | "png" }>({
      query: ({ tagId, ...body }) => ({
        url: `/tags/${tagId}/etag/send`,
        method: "POST",
        body,
      }),
    }),
    createTag: builder.mutation<any, { tagType: string; assetId?: string; label?: string }>({
      query: (body) => ({
        url: "/tags",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tag"],
    }),
    listTags: builder.query<any[], void>({
      query: () => "/tags",
      providesTags: ["Tag"],
    }),
    activateTag: builder.mutation<any, string>({
      query: (tagId) => ({
        url: `/tags/${tagId}/activate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, tagId) => [{ type: "Tag", id: tagId }],
    }),
    deactivateTag: builder.mutation<any, { tagId: string; reason?: string }>({
      query: ({ tagId, reason }) => ({
        url: `/tags/${tagId}/deactivate`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (result, error, { tagId }) => [{ type: "Tag", id: tagId }],
    }),
    rotateTagToken: builder.mutation<{ tagId: string; publicToken: string }, string>({
      query: (tagId) => ({
        url: `/tags/${tagId}/rotate-token`,
        method: "POST",
      }),
      invalidatesTags: (result, error, tagId) => [{ type: "Tag", id: tagId }],
    }),
    linkNfc: builder.mutation<any, { tagId: string; nfcUid: string }>({
      query: ({ tagId, nfcUid }) => ({
        url: `/tags/${tagId}/nfc`,
        method: "POST",
        body: { nfcUid },
      }),
      invalidatesTags: (result, error, { tagId }) => [{ type: "Tag", id: tagId }],
    }),
    linkAsset: builder.mutation<any, { tagId: string; assetId: string }>({
      query: ({ tagId, assetId }) => ({
        url: `/tags/${tagId}/asset`,
        method: "POST",
        body: { assetId },
      }),
      invalidatesTags: (result, error, { tagId }) => [{ type: "Tag", id: tagId }],
    }),
    getTagHistory: builder.query<any[], string>({
      query: (tagId) => `/tags/${tagId}/history`,
      providesTags: (result, error, tagId) => [{ type: "Tag", id: tagId }],
    }),
    getTagQr: builder.query<string, { tagId: string; format?: "svg" | "png"; size?: number }>({
      query: ({ tagId, format = "svg", size = 512 }) => `/tags/${tagId}/qr?format=${format}&size=${size}`,
    }),
    getQrSizes: builder.query<{ size: number; label: string }[], void>({
      query: () => `/qr-sizes/active`,
    }),
    generateCustomQr: builder.mutation<{ qrCodeDataUrl: string; publicToken: string }, { tagId: string; size?: number; format?: "png" | "svg" | "webp"; theme?: string; shape?: string; logo?: any }>({
      query: ({ tagId, ...options }) => ({
        url: `/tags/${tagId}/qr/custom`,
        method: "POST",
        body: options,
      }),
    }),
  }),
});

export const {
  useGetTagQuery,
  useGetTagPublicTokenQuery,
  useGenerateEtagMutation,
  useSendEtagMutation,
  useCreateTagMutation,
  useListTagsQuery,
  useActivateTagMutation,
  useDeactivateTagMutation,
  useRotateTagTokenMutation,
  useLinkNfcMutation,
  useLinkAssetMutation,
  useGetTagHistoryQuery,
  useGetTagQrQuery,
  useLazyGetTagQrQuery,
  useGetQrSizesQuery,
  useGenerateCustomQrMutation,
} = tagsApi;