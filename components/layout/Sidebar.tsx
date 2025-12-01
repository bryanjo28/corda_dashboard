"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, History, Settings, Layers } from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "History", href: "/history", icon: History },
  // { name: "Transactions", href: "/dashboard#tx", icon: Layers },
  // { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950/95 border-r border-slate-800/60 backdrop-blur-xl p-6 flex flex-col">
      <div className="text-xl font-bold mb-8">💳 CordaBank</div>
      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = path.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                active
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-800/40"
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto text-xs text-slate-500">
        Corda Dashboard v1.0
      </div>
    </aside>
  );
}
