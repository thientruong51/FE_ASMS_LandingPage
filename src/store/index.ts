import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import notificationSlice from "./notificationSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    notification: notificationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
