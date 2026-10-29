import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

export const vehiclesApi = createApi({
  reducerPath: "vehiclesApi",
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
  tagTypes: ["Vehicle"],
  endpoints: (builder) => ({
    listVehicles: builder.query<any[], void>({
      query: () => "/vehicles",
      providesTags: ["Vehicle"],
    }),
    createVehicle: builder.mutation<any, { registration: string; make?: string; model?: string; variant?: string; color?: string; year?: number; vehicleType?: string; fuelType?: string; insuranceExpiry?: string; pucExpiry?: string; fastagStatus?: string }>({
      query: (body) => ({
        url: "/vehicles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getVehicle: builder.query<any, string>({
      query: (id) => `/vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: "Vehicle", id }],
    }),
    updateVehicle: builder.mutation<any, { id: string; body: Partial<any> }>({
      query: ({ id, body }) => ({
        url: `/vehicles/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Vehicle", id }],
    }),
    deleteVehicle: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getVehicleActivity: builder.query<any[], string>({
      query: (vehicleId) => `/vehicles/${vehicleId}/activity`,
      providesTags: (result, error, vehicleId) => [{ type: "Vehicle", id: vehicleId }],
    }),
  }),
});

export const {
  useListVehiclesQuery,
  useCreateVehicleMutation,
  useGetVehicleQuery,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehicleActivityQuery,
} = vehiclesApi;