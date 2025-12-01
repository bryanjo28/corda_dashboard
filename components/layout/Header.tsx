"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [dark, setDark] = useState(true);

  // load theme awal dari localStorage (optional tapi enak)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  // simpan theme ke localStorage tiap kali berubah
  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
      }
      return next;
    });
  };

  return (
    <header className="fixed left-64 top-0 right-0 h-16 bg-card border-b border-[var(--border-color)] backdrop-blur-xl flex items-center justify-between px-6 z-50 transition-colors">
      <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/6.x/identicon/svg?seed=user"
            className="w-8 h-8 rounded-full border border-[var(--border-color)]"
          />
          <span className="text-sm text-[var(--text-muted)]">Bank A Admin</span>
        </div>
      </div>
    </header>
  );
}
