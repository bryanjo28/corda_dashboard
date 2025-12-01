import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";


interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading,
  className,
  disabled,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<typeof variant, string> = {
    primary:
      "bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700",
    ghost:
      "bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-100",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
      )}
      {children}
    </button>
  );
}
