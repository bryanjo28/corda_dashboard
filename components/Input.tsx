import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label && <span>{label}</span>}
      <input
        className={
          "w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-main placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/70 " +
          (className || "")
        }
        {...rest}
      />
    </label>
  );
}
