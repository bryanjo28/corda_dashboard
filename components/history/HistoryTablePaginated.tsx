"use client";

import { TxRow } from "@/lib/txStore";
import { useState } from "react";
import Modal from "@/components/modal/Modal";

const PER_PAGE = 10;

export default function HistoryTablePaginated({
  data,
  page,
  onChangePage,
}: {
  data: TxRow[];
  page: number;
  onChangePage: (p: number) => void;
}) {
  const pages = Math.ceil(data.length / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const sliced = data.slice(start, start + PER_PAGE);

  const [selected, setSelected] = useState<TxRow | null>(null);

  return (
    <>
      <div className="glass-card transition-colors p-6 mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 text-muted">
              <th className="py-2 text-left">#</th>
              <th className="py-2 text-left">Waktu</th>
              <th className="py-2 text-left">Jenis</th>
              <th className="py-2 text-left">txHash</th>
              <th className="py-2 text-left">Info</th>
            </tr>
          </thead>

          <tbody>
            {sliced.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer"
                onClick={() => setSelected(tx)}
              >
                <td className="py-2">{tx.id}</td>
                <td>{tx.time}</td>
                <td>{tx.type}</td>
                <td className="text-emerald-400">{tx.txHash}</td>
                <td>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <button
            disabled={page <= 1}
            onClick={() => onChangePage(page - 1)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-muted">
            Page {page} / {pages}
          </span>

          <button
            disabled={page >= pages}
            onClick={() => onChangePage(page + 1)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal visible={selected} onClose={() => setSelected(null)}>
        <h2 className="text-lg font-semibold mb-3">Detail Transaksi</h2>
        {selected && (
          <div className="text-sm text-[var(--text-muted)] space-y-2">
            <p><b>ID:</b> {selected.id}</p>
            <p><b>Waktu:</b> {selected.time}</p>
            <p><b>Jenis:</b> {selected.type}</p>
            <p><b>txHash:</b> {selected.txHash}</p>
            <p><b>Deskripsi:</b> {selected.description}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
