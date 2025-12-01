export type TxType = "Issue" | "Transfer" | "Redeem";

export interface TxRow {
  id: number;
  time: string;
  type: TxType;
  txHash: string;
  description: string;
}

interface Props {
  rows: TxRow[];
}

export default function TxTable({ rows }: Props) {
  if (!rows.length) {
    return (
      <div className="py-8 text-center text-xs text-muted">
        Belum ada transaksi. Lakukan Issue / Transfer / Redeem untuk melihat
        riwayat.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-slate-900/80 text-muted">
            <th className="px-3 py-2 text-left font-medium">#</th>
            <th className="px-3 py-2 text-left font-medium">Waktu</th>
            <th className="px-3 py-2 text-left font-medium">Jenis</th>
            <th className="px-3 py-2 text-left font-medium">txHash</th>
            <th className="px-3 py-2 text-left font-medium">Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr
              key={tx.id}
              className="border-t border-slate-800/70 hover:bg-slate-900/60"
            >
              <td className="px-3 py-2 align-top text-muted">{tx.id}</td>
              <td className="px-3 py-2 align-top text-main">{tx.time}</td>
              <td className="px-3 py-2 align-top">
                <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-main">
                  {tx.type}
                </span>
              </td>
              <td className="px-3 py-2 align-top text-main break-all">
                {tx.txHash === "-" ? (
                  "-"
                ) : (
                  <button
                    className="underline decoration-dotted underline-offset-2 hover:text-emerald-400"
                    onClick={() => navigator.clipboard.writeText(tx.txHash)}
                  >
                    {tx.txHash}
                  </button>
                )}
              </td>
              <td className="px-3 py-2 align-top text-main">
                {tx.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
