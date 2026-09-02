import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export default AuthContext;
