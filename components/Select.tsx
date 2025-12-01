import { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export default function Select({ label, options, className, ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label && <span>{label}</span>}
      <select
        className={
          "w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-main focus:outline-none focus:ring-2 focus:ring-emerald-500/70 " +
          (className || "")
        }
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
