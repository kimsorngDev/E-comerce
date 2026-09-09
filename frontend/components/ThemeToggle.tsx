"use client";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-full bg-slate-200/60 dark:bg-slate-800/80 p-0.5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-200 ${
          theme === "light"
            ? "bg-white text-amber-500 shadow-sm font-bold scale-105"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <path strokeLinecap="round" strokeWidth="2" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-200 ${
          theme === "dark"
            ? "bg-slate-900 text-blue-400 shadow-sm font-bold scale-105"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-200 ${
          theme === "system"
            ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold scale-105"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
        title="System Auto"
        aria-label="System Theme"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
          <path strokeLinecap="round" strokeWidth="2" d="M8 21h8m-4-4v4" />
        </svg>
      </button>
    </div>
  );
}
