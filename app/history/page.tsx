"use client";

import HistoryTablePaginated from "@/components/history/HistoryTablePaginated";
import { useTxStore } from "@/lib/txStore";
import { useState } from "react";

export default function HistoryPage() {
  const { txs } = useTxStore();
  const [page, setPage] = useState(1);

  return (
    <div className="ml-64 pt-20 px-8 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Riwayat Transaksi</h1>

      <HistoryTablePaginated
        data={txs}
        page={page}
        onChangePage={setPage}
      />
    </div>
  );
}
