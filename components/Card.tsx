interface Props {
  title: string;
  subtitle?: string;
  value: string | number;
  accent?: "A" | "B";
}

export default function Card({ title, subtitle, value, accent }: Props) {
  const badge =
    accent === "A"
      ? "from-emerald-400 to-emerald-600"
      : "from-sky-400 to-sky-600";

  return (
    <div className="glass-card p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-slate-200">{title}</h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {accent && (
          <div
            className={`rounded-full bg-gradient-to-tr ${badge} px-3 py-1 text-xs font-semibold text-slate-950`}
          >
            {accent === "A" ? "Issuer" : "Bene"}
          </div>
        )}
      </div>
      <p className="text-3xl font-semibold tracking-tight text-slate-50">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-slate-500">
        Nominal dalam satuan rupiah digital.
      </p>
    </div>
  );
}
