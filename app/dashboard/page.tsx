"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import TxTable, { TxRow } from "@/components/TxTable";
import { useToast } from "@/components/toast/useToast";

type Bank = "A" | "B";

export default function DashboardPage() {
  // ⬇⬇ TARUH DI SINI (SEBELUM return)
  const toast = useToast();

  const [saldoA, setSaldoA] = useState<string>("...");
  const [saldoB, setSaldoB] = useState<string>("...");
  const [loadingSaldo, setLoadingSaldo] = useState<boolean>(false);

  const [issueAmount, setIssueAmount] = useState("1000");
  const [issueOwner, setIssueOwner] = useState("PartyB");
  const [issueStatus, setIssueStatus] = useState<string>("");

  const [txHash, setTxHash] = useState("");
  const [txIndex, setTxIndex] = useState("0");
  const [newOwner, setNewOwner] = useState("PartyB");
  const [transferStatus, setTransferStatus] = useState<string>("");

  const [redeemAmount, setRedeemAmount] = useState("100");
  const [redeemIssuer, setRedeemIssuer] = useState("PartyA");
  const [redeemStatus, setRedeemStatus] = useState<string>("");

  const [txs, setTxs] = useState<TxRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- Fetch Saldo ----------
  const fetchSaldo = async () => {
    try {
      setLoadingSaldo(true);
      const [a, b] = await Promise.all([
        fetch("/api/balance?bank=A").then((r) => r.text()),
        fetch("/api/balance?bank=B").then((r) => r.text()),
      ]);
      setSaldoA(a);
      setSaldoB(b);
    } catch (err) {
      setSaldoA("Error");
      setSaldoB("Error");
    } finally {
      setLoadingSaldo(false);
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  const pushTx = (row: Omit<TxRow, "id" | "time">) => {
    setTxs((prev) => [
      {
        id: prev.length + 1,
        time: new Date().toLocaleTimeString(),
        ...row,
      },
      ...prev,
    ]);
  };

  // ---------- Issue ----------
const handleIssue = async () => {
  if (!issueAmount || Number(issueAmount) <= 0) {
    toast.error("Jumlah issue tidak valid.");
    return;
  }

  setIsSubmitting(true);
  toast.info("Memproses issue...");

  try {
    const res = await fetch("/api/issue", {
      method: "POST",
      body: JSON.stringify({ amount: issueAmount, owner: issueOwner }),
    });

    const txt = await res.text();
    setIssueStatus(txt);

    // Cek apakah berhasil
    if (txt.includes("Issued")) {
      toast.success("Issue berhasil!");

      // Cari txHash seperti versi HTML lama
      const match = txt.match(/Issued\s+([^\s]+)/);
      const hash = match ? match[1] : "";

      if (hash) {
        setTxHash(hash);
        pushTx({
          type: "Issue",
          txHash: hash,
          description: `Issue Rp ${issueAmount} → ${issueOwner}`,
        });
      }
    } else {
      // API jalan tapi hasil tidak OK
      toast.error("Issue gagal!");
    }

    await fetchSaldo();
  } catch (err) {
    toast.error("Terjadi kesalahan jaringan.");
    setIssueStatus("Gagal issue.");
  } finally {
    setIsSubmitting(false);
  }
};


  // ---------- Transfer ----------
const handleTransfer = async () => {
  if (!txHash.trim()) {
    toast.error("Mohon isi txHash terlebih dahulu.");
    setTransferStatus("Isi txHash dulu.");
    return;
  }

  setIsSubmitting(true);
  setTransferStatus("Memproses transfer...");
  toast.info("Memproses transfer...");

  try {
    const res = await fetch("/api/transfer", {
      method: "POST",
      body: JSON.stringify({
        txHash: txHash.trim(),
        index: Number(txIndex || 0),
        newOwner,
      }),
    });

    const txt = await res.text();
    setTransferStatus(txt);

    if (txt.includes("Transferred") || txt.includes("Success")) {
      toast.success("Transfer berhasil!");

      pushTx({
        type: "Transfer",
        txHash: txHash.trim(),
        description: `A → ${newOwner} (idx: ${txIndex})`,
      });

    } else {
      toast.error("Transfer gagal.");
    }

    await fetchSaldo();
  } catch (err) {
    toast.error("Terjadi kesalahan jaringan.");
    setTransferStatus("Gagal transfer.");
  } finally {
    setIsSubmitting(false);
  }
};


  // ---------- Redeem ----------
 
const handleRedeem = async () => {
  if (!redeemAmount || Number(redeemAmount) <= 0) {
    toast.error("Jumlah redeem tidak valid.");
    return;
  }

  setIsSubmitting(true);
  setRedeemStatus("Memproses redeem...");
  toast.info("Memproses redeem...");

  try {
    const res = await fetch("/api/redeem", {
      method: "POST",
      body: JSON.stringify({
        amount: redeemAmount,
        issuer: redeemIssuer,
      }),
    });

    const txt = await res.text();
    setRedeemStatus(txt);

    if (txt.includes("Redeemed") || txt.includes("Success")) {
      toast.success("Redeem berhasil!");

      pushTx({
        type: "Redeem",
        txHash: "-",
        description: `Redeem Rp ${redeemAmount} via ${redeemIssuer}`,
      });
    } else {
      toast.error("Redeem gagal.");
    }

    await fetchSaldo();
  } catch (err) {
    toast.error("Terjadi kesalahan jaringan.");
    setRedeemStatus("Gagal redeem.");
  } finally {
    setIsSubmitting(false);
  }
};

  const disabled = isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top bar */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Corda Rupiah Dashboard
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">
              Simulasi issue, transfer & redeem dengan tampilan banking-grade.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={fetchSaldo}
            loading={loadingSaldo}
            className="self-start md:self-auto"
          >
            Refresh Saldo
          </Button>
        </header>

        {/* Balance cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Card
            title="Bank A"
            subtitle="Issuer / Notary"
            value={saldoA}
            accent="A"
          />
          <Card
            title="Bank B"
            subtitle="Beneficiary"
            value={saldoB}
            accent="B"
          />
        </section>

        {/* Action panels */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Issue */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">1. Issue Uang Baru</h2>
              <p className="text-xs text-slate-400">
                Bank A menerbitkan rupiah digital ke account tertentu.
              </p>
            </div>
            <Input
              label="Jumlah (Rp)"
              type="number"
              min={1}
              value={issueAmount}
              onChange={(e) => setIssueAmount(e.target.value)}
            />
            <Select
              label="Penerima Awal"
              value={issueOwner}
              onChange={(e) => setIssueOwner(e.target.value)}
              options={[
                { value: "PartyB", label: "Bank B" },
                { value: "PartyA", label: "Bank A" },
              ]}
            />
            {issueStatus && (
              <p className="text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                {issueStatus}
              </p>
            )}
            <Button onClick={handleIssue} disabled={disabled}>
              Issue
            </Button>
          </div>

          {/* Transfer */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">2. Transfer Uang</h2>
              <p className="text-xs text-slate-400">
                Gunakan txHash hasil issue untuk memindahkan kepemilikan.
              </p>
            </div>
            <Input
              label="txHash"
              placeholder="Hash dari hasil Issue"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
            <Input
              label="Index"
              type="number"
              min={0}
              value={txIndex}
              onChange={(e) => setTxIndex(e.target.value)}
            />
            <Select
              label="Pemilik Baru"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              options={[
                { value: "PartyB", label: "Bank B" },
                { value: "PartyA", label: "Bank A" },
              ]}
            />
            {transferStatus && (
              <p className="text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                {transferStatus}
              </p>
            )}
            <Button onClick={handleTransfer} disabled={disabled}>
              Transfer
            </Button>
          </div>

          {/* Redeem */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">3. Redeem (Penebusan)</h2>
              <p className="text-xs text-slate-400">
                Bank B menebus saldo kembali ke Bank A sebagai issuer.
              </p>
            </div>
            <Input
              label="Jumlah (Rp)"
              type="number"
              min={1}
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
            />
            <Select
              label="Issuer"
              value={redeemIssuer}
              onChange={(e) => setRedeemIssuer(e.target.value)}
              options={[
                { value: "PartyA", label: "Bank A (Issuer)" },
                { value: "PartyB", label: "Bank B" },
              ]}
            />
            {redeemStatus && (
              <p className="text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                {redeemStatus}
              </p>
            )}
            <Button onClick={handleRedeem} disabled={disabled}>
              Redeem
            </Button>
          </div>
        </section>

        {/* Transaction history */}
        <section className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Riwayat Transaksi</h2>
              <p className="text-xs text-slate-400">
                Issue, transfer, dan redeem terbaru akan muncul di sini.
              </p>
            </div>
          </div>
          <TxTable rows={txs} />
        </section>
      </div>
    </div>
  );
}
