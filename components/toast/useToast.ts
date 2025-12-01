"use client";

import { useToastContext } from "./ToastProvider";

export function useToast() {
  const ctx = useToastContext();
  return {
    success: (msg: string) => ctx.showToast(msg, "success"),
    error: (msg: string) => ctx.showToast(msg, "error"),
    info: (msg: string) => ctx.showToast(msg, "info"),
  };
}
