import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const familyApi = createApi({
  reducerPath: "familyApi",
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
  tagTypes: ["FamilyMember"],
  endpoints: (builder) => ({
    listFamilyMembers: builder.query<any[], void>({
      query: () => "/family/members",
      providesTags: ["FamilyMember"],
    }),
    addFamilyMember: builder.mutation<any, { name: string; relationship: string; phone: string; permissions: string[] }>({
      query: (body) => ({
        url: "/family/members",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FamilyMember"],
    }),
    deleteFamilyMember: builder.mutation<void, string>({
      query: (memberId) => ({
        url: `/family/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FamilyMember"],
    }),
  }),
});

export const {
  useListFamilyMembersQuery,
  useAddFamilyMemberMutation,
  useDeleteFamilyMemberMutation,
} = familyApi;