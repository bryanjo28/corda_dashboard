"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { useToast } from "@/components/toast/useToast";

type Bank = "A" | "B" | "C";

interface TxRow {
  _id: string;
  time: string;
  type: string;
  txHash: string;
  description: string;
  owner?: string;
}

export default function HistoryPage() {
  const toast = useToast();

  const [txs, setTxs] = useState<TxRow[]>([]);
  const [selected, setSelected] = useState<TxRow | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("All");
  const [bank, setBank] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);

  const pages = Math.ceil(total / limit);

  const formatDate = (isoTime: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "short",
      timeStyle: "medium",
      hour12: false,
    })
      .format(new Date(isoTime))
      .replace(/\./g, ":");
  };

  const fetchSession = async () => {
    const res = await fetch("/api/auth/session");
    const data = await res.json();
    setBank(data?.user?.bank || null);
    setLoading(false);
  };

  const fetchHistory = async () => {
    if (!bank) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filter,
        page: String(page),
        limit: String(limit),
      });
      if (bank !== "A") params.set("bank", bank);

      const res = await fetch(`/api/txHistory?${params.toString()}`);
      const data = await res.json();
      setTxs(data.txs);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (bank) fetchHistory();
  }, [page, filter, bank]);

  return (
    <div className="px-8 py-6 min-h-screen">
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
              <th className="py-2 text-left">Owner</th>
              <th className="py-2 text-left">txHash</th>
              <th className="py-2 text-left">Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {txs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted">
                  {loading ? "Memuat..." : "Tidak ada transaksi."}
                </td>
              </tr>
            ) : (
              txs.map((tx) => (
                <tr
                  key={tx._id}
                  onClick={() => setSelected(tx)}
                  className="border-b border-[var(--border-color)] hover:bg-slate-800/30 cursor-pointer transition"
                >
                  <td className="py-2">{formatDate(tx.time)}</td>
                  <td>{tx.type}</td>
                  <td>{tx.owner || "-"}</td>
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
              <b>Waktu:</b> {formatDate(selected.time)}
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

            <p>
              <b>Deskripsi:</b> {selected.description}
            </p>
            <p>
              <b>Owner sekarang:</b> {selected.owner || "-"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
