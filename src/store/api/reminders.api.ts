import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const remindersApi = createApi({
  reducerPath: "remindersApi",
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
  tagTypes: ["Reminder"],
  endpoints: (builder) => ({
    listReminders: builder.query<any[], void>({
      query: () => "/reminders",
      providesTags: ["Reminder"],
    }),
    createReminder: builder.mutation<any, { vehicleId?: string; reminderType: string; title: string; dueAt: string }>({
      query: (body) => ({
        url: "/reminders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reminder"],
    }),
    updateReminder: builder.mutation<any, { reminderId: string; patch: Partial<{ title: string; dueAt: string; status: string }> }>({
      query: ({ reminderId, patch }) => ({
        url: `/reminders/${reminderId}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Reminder"],
    }),
    deleteReminder: builder.mutation<void, string>({
      query: (reminderId) => ({
        url: `/reminders/${reminderId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminder"],
    }),
  }),
});

export const {
  useListRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = remindersApi;