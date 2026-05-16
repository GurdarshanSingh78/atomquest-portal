"use client";
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  // Read previous saved preference from browser on startup
  useEffect(() => {
    const savedTheme = localStorage.getItem("nexus_theme");
    if (savedTheme === "light") {
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const nextMode = !prev;
      localStorage.setItem("nexus_theme", nextMode ? "dark" : "light");
      return nextMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);