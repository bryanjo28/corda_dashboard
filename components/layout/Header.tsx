"use client";

import { Moon, Sun, LogOut, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

type Bank = "A" | "B" | "C";

interface HeaderProps {
  session: (Session & { user: { username: string; bank: Bank } }) | null;
}

export default function Header({ session }: HeaderProps) {
  const [dark, setDark] = useState(true);
  const [open, setOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!session?.user) return "User";
    return `${session.user.username} • Bank ${session.user.bank}`;
  }, [session]);

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

      <div className="flex items-center gap-4 relative">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/30 transition-colors border border-transparent hover:border-[var(--border-color)]"
        >
          <img
            src={`https://api.dicebear.com/6.x/identicon/svg?seed=${session?.user?.username || "user"}`}
            className="w-8 h-8 rounded-full border border-[var(--border-color)]"
          />
          <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
            {displayName}
          </span>
          <ChevronDown size={14} />
        </button>

        {open && (
          <div className="absolute right-0 top-12 bg-card border border-[var(--border-color)] rounded-lg shadow-lg w-44 py-1">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-800/30 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
