import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "./auth.api";
import { tagsApi } from "./tags.api";
import { vehiclesApi } from "./vehicles.api";
import { scannerApi } from "./scanner.api";
import { documentsApi } from "./documents.api";
import { remindersApi } from "./reminders.api";
import { familyApi } from "./family.api";
import { emergencyApi } from "./emergency.api";
import { locationApi } from "./location.api";
import { adminApi } from "./admin.api";

export const apiReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [tagsApi.reducerPath]: tagsApi.reducer,
  [vehiclesApi.reducerPath]: vehiclesApi.reducer,
  [scannerApi.reducerPath]: scannerApi.reducer,
  [documentsApi.reducerPath]: documentsApi.reducer,
  [remindersApi.reducerPath]: remindersApi.reducer,
  [familyApi.reducerPath]: familyApi.reducer,
  [emergencyApi.reducerPath]: emergencyApi.reducer,
  [locationApi.reducerPath]: locationApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

// Export all hooks from feature APIs
export * from "./auth.api";
export * from "./tags.api";
export * from "./vehicles.api";
export {
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
} from "./scanner.api";
export * from "./documents.api";
export * from "./reminders.api";
export * from "./family.api";
export {
  useListEmergencyContactsQuery,
  useCreateEmergencyContactMutation,
  useUpdateEmergencyContactMutation,
  useDeleteEmergencyContactMutation,
  useListEmergencyAlertsQuery,
  useRaiseEmergencyMutation as useRaiseEmergencyAlertMutation,
} from "./emergency.api";
export * from "./location.api";
export * from "./admin.api";

// Export the RTK Query API objects so the store can wire their reducerPaths
// and middleware individually.
export {
  authApi,
  tagsApi,
  vehiclesApi,
  scannerApi,
  documentsApi,
  remindersApi,
  familyApi,
  emergencyApi,
  locationApi,
  adminApi,
};