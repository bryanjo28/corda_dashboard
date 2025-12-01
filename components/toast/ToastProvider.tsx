"use client";

import { createContext, useContext, useState, useCallback } from "react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border animate-slide-in text-sm font-medium",
              {
                "bg-emerald-500/80 border-emerald-400 text-slate-950":
                  toast.type === "success",
                "bg-red-500/80 border-red-400 text-white":
                  toast.type === "error",
                "bg-sky-500/80 border-sky-400 text-slate-950":
                  toast.type === "info",
              }
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToastContext = () => useContext(ToastContext);
