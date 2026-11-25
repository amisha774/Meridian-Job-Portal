import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notificationsApi } from '../services/api';
import { NotificationItem } from '../types';

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await notificationsApi.list();
  return data;
});

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string) => {
    await notificationsApi.markRead(id);
    return id;
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    await notificationsApi.markAllRead();
  }
);

export const removeNotification = createAsyncThunk('notifications/remove', async (id: string) => {
  await notificationsApi.remove(id);
  return id;
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addRealtimeNotification(state, action: PayloadAction<NotificationItem>) {
      const exists = state.items.some((item) => item._id === action.payload._id);
      if (exists) return;
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const target = state.items.find((n) => n._id === action.payload);
        if (target && !target.isRead) {
          target.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(removeNotification.fulfilled, (state, action) => {
        const target = state.items.find((n) => n._id === action.payload);
        if (target && !target.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n._id !== action.payload);
      });
  },
});

export const { addRealtimeNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
