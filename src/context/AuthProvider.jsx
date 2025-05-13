import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { registerUser, loginUser, logoutUser, getCurrentUser, isLoggedIn as checkIsLoggedIn } from '../api/auth';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => checkIsLoggedIn());
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    setIsLoggedIn(checkIsLoggedIn());
    setUser(getCurrentUser());
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success) {
      setIsLoggedIn(true);
      setUser(res.user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setUser(null);
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    return res.success;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 