import { createContext, useContext, useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState(() => localStorage.getItem('mechat_theme') || 'dark');

  useEffect(() => {
    if (user?.theme && user.theme !== 'system') setTheme(user.theme);
  }, [user?.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('mechat_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
