import { useAppDispatch, useAppSelector } from '../redux/store';
import { logoutUser } from '../redux/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  const getDashboardPath = () => {
    if (auth.user?.role === 'admin') return '/admin';
    if (auth.user?.role === 'recruiter') return '/recruiter';
    return '/seeker';
  };

  return {
    ...auth,
    getDashboardPath,
    logout: () => dispatch(logoutUser()),
  };
}
