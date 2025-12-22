import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type NotificationItem = {
  id: string;
  orderCode: string;
  status: string;

  title: string;
  message: string;

  createdAt: number;
  read: boolean;
};

type NotificationState = {
  items: NotificationItem[];
};

const MAX_NOTIFICATIONS = 50;

const initialState: NotificationState = {
  items: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<NotificationItem>
    ) => {
      const incoming = action.payload;

      // 🔒 chống trùng (cùng order + cùng status)
      const exists = state.items.some(
        n =>
          n.orderCode === incoming.orderCode &&
          n.status === incoming.status
      );

      if (exists) return;

      state.items.unshift(incoming);

      // 🧹 giới hạn số lượng
      if (state.items.length > MAX_NOTIFICATIONS) {
        state.items = state.items.slice(0, MAX_NOTIFICATIONS);
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const n = state.items.find(i => i.id === action.payload);
      if (n) n.read = true;
    },

    markAllAsRead: (state) => {
      state.items.forEach(i => {
        i.read = true;
      });
    },

    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
