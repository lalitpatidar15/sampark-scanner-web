import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Owner session state for the scanner web app. The RTK Query slices read
 * `state.auth.accessToken` in their `prepareHeaders` to attach a Bearer token,
 * so this slice is the single place the session lives in the store.
 *
 * The token is mirrored in `localStorage` by the owner of the session (see the
 * provider/hook that dispatches these actions) so a refresh keeps the owner
 * signed in without ever exposing it to the public scanner flow.
 */
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: Record<string, unknown> | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string; user?: Record<string, unknown> }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken !== undefined) state.refreshToken = action.payload.refreshToken;
      if (action.payload.user !== undefined) state.user = action.payload.user;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;
