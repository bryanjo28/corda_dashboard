"use client";

import TxTablePaginated from "@/components/TxTablePaginated";
import { useState } from "react";


export default function HistoryPage() {
  const [page, setPage] = useState(1);

  return (
    <div className="ml-64 pt-20 px-8 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Riwayat Transaksi</h1>

      <TxTablePaginated page={page} onChangePage={setPage} />
    </div>
  );
}
