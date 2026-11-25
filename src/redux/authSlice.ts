import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, TOKEN_STORAGE_KEY } from '../services/api';
import { User } from '../types';
import { extractErrorMessage } from '../utils/formatters';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  error: string | null;
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isAuthenticated: false,
  initializing: Boolean(initialToken),
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authApi.me();
      return data.user;
    } catch (err) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return rejectWithValue(extractErrorMessage(err, 'Session expired'));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Failed to sign in'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: {
      fullName: string;
      email: string;
      password: string;
      phone?: string;
      role: 'jobseeker' | 'recruiter';
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await authApi.register(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err, 'Registration failed'));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch {
    // Clear local state regardless
  }
  localStorage.removeItem(TOKEN_STORAGE_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.initializing = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initializing = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initializing = false;
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
