"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { useToast } from "@/components/toast/useToast";

interface TxRow {
  _id: string;
  time: string;
  type: string;
  txHash: string;
  description: string;
}



export default function HistoryPage() {
  const toast = useToast();

  const [txs, setTxs] = useState<TxRow[]>([]);
  const [selected, setSelected] = useState<TxRow | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("All");
  const pages = Math.ceil(total / limit);

  const formatDate = (isoTime: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "short",   // contoh: 02/12/2025
      timeStyle: "medium",  // contoh: 09.50.56
      hour12: false,
    })
      .format(new Date(isoTime))
      .replace(/\./g, ":"); // ubah semua titik jadi titik dua
  };


  const fetchHistory = async () => {
    const res = await fetch(
      `/api/txHistory?type=${filter}&page=${page}&limit=${limit}`
    );
    const data = await res.json();
    setTxs(data.txs);
    setTotal(data.total);
  };

  useEffect(() => {
    fetchHistory();
  }, [page, filter]);

  return (
    <div className="ml-64 pt-20 px-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-main">Riwayat Transaksi</h1>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
          className="bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg px-3 py-2"
        >
          <option value="All">Semua</option>
          <option value="Issue">Issue</option>
          <option value="Transfer">Transfer</option>
          <option value="Redeem">Redeem</option>
        </select>
      </div>

      <div className="glass-card p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
              <th className="py-2 text-left">Waktu</th>
              <th className="py-2 text-left">Jenis</th>
              <th className="py-2 text-left">txHash</th>
              <th className="py-2 text-left">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-muted">
                  Tidak ada transaksi.
                </td>
              </tr>
            ) : (
              txs.map((tx) => (
                <tr
                  key={tx._id}
                  onClick={() => setSelected(tx)}
                  className="border-b border-[var(--border-color)] hover:bg-slate-800/30 cursor-pointer transition"
                >
                  <td className="py-2">
                    {formatDate(tx.time)}
                  </td>
                  <td>{tx.type}</td>
                  <td className="text-emerald-400 truncate max-w-[200px]">
                    {tx.txHash}
                  </td>
                  <td>{tx.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-[var(--text-muted)] text-sm">
            Halaman {page} / {pages || 1}
          </span>

          <button
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Detail */}
      <Modal visible={selected} onClose={() => setSelected(null)}>
        <h2 className="text-lg font-semibold mb-3">Detail Transaksi</h2>
        {selected && (
          <div className="text-sm text-[var(--text-muted)] space-y-2">
            <p>
              <b>Waktu:</b>{" "}
              {formatDate(selected.time)}
            </p>
            <p
              className="break-all text-emerald-400 font-mono cursor-pointer hover:text-emerald-300 transition"
              title="Klik untuk menyalin txHash"
              onClick={(e) => {
                e.stopPropagation();

                if (!selected) return;

                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(selected.txHash);
                  toast.success("txHash disalin!");
                } else {
                  toast.error("Clipboard API tidak tersedia.");
                }
              }}
            >

              <b className="text-[var(--text-muted)] mr-1">txHash:</b>
              <span className="bg-emerald-500/10 px-2 py-1 rounded-md select-text">
                {selected.txHash}
              </span>
            </p>

            {/* <p className="break-all">
              <b>txHash:</b> {selected.txHash}
            </p> */}
            <p>
              <b>Deskripsi:</b> {selected.description}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
