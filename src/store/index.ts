import { configureStore } from "@reduxjs/toolkit";
import { apiReducer } from "./api";
import { authApi, tagsApi, vehiclesApi, scannerApi, documentsApi, remindersApi, familyApi, emergencyApi, locationApi, adminApi } from "./api";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(tagsApi.middleware)
      .concat(vehiclesApi.middleware)
      .concat(scannerApi.middleware)
      .concat(documentsApi.middleware)
      .concat(remindersApi.middleware)
      .concat(familyApi.middleware)
      .concat(emergencyApi.middleware)
      .concat(locationApi.middleware)
      .concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;