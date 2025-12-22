import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  hasOrderUpdate: boolean;
}

const initialState: UiState = {
  hasOrderUpdate: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    notifyOrderChanged(state) {
      state.hasOrderUpdate = true;
    },
    clearOrderNotification(state) {
      state.hasOrderUpdate = false;
    },
  },
});

export const {
  notifyOrderChanged,
  clearOrderNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
