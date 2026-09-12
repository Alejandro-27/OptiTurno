import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Revisa si el usuario ya guardó una preferencia anteriormente
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Si es la primera vez, toma la preferencia del sistema operativo
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 p-2 text-slate-800 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label="Cambiar tema"
    >
      {isDark ? (
        <>
          <Sun size={17} className="text-amber-400" />
          <span className="hidden text-sm font-medium sm:inline">Claro</span>
        </>
      ) : (
        <>
          <Moon size={17} className="text-indigo-600" />
          <span className="hidden text-sm font-medium sm:inline">Oscuro</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;