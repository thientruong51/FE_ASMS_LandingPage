import type { RootState } from "./index";

export const selectNotifications = (state: RootState) =>
  state.notification.items;

export const selectUnreadNotifications = (state: RootState) =>
  state.notification.items.filter(n => !n.read);

export const selectUnreadCount = (state: RootState) =>
  state.notification.items.filter(n => !n.read).length;
