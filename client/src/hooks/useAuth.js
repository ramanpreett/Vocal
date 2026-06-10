import { useState, useCallback } from 'react';
import * as api from '../api';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checked, setChecked] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await api.getMe();
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {
      // server not available
    } finally {
      setChecked(true);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.login(username, password);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (username, password) => {
    const res = await api.signup(username, password);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed.');
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const doLogout = useCallback(async () => {
    await api.logout();
    setCurrentUser(null);
  }, []);

  return { currentUser, setCurrentUser, checked, checkSession, login, signup, logout: doLogout };
}
