"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [dark, setDark] = useState(true);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("light");
  };

  return (
    <header className="fixed left-64 top-0 right-0 h-16 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-6 z-50">
      <h2 className="text-lg font-semibold tracking-tight">Dashboard</h2>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-800/50">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/6.x/identicon/svg?seed=user"
            className="w-8 h-8 rounded-full border border-slate-700"
          />
          <span className="text-sm text-slate-300">Bank A Admin</span>
        </div>
      </div>
    </header>
  );
}
