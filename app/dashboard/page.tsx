"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import TxTable, { TxRow } from "@/components/TxTable";
import { useToast } from "@/components/toast/useToast";
import { useTxStore } from "@/lib/txStore";

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

  const [currentOwner, setCurrentOwner] = useState<"PartyA" | "PartyB" | "">("");


  const { txs, pushTx } = useTxStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // ---------- Fetch Saldo ----------
  const fetchSaldo = async () => {
    try {
      setLoadingSaldo(true);

      const [a, b] = await Promise.all([
        fetch("/api/balance?bank=A").then((r) => r.text()),
        fetch("/api/balance?bank=B").then((r) => r.text()),
      ]);

      const cleanA = a.replace(/^"|"$/g, "").trim();
      const cleanB = b.replace(/^"|"$/g, "").trim();

      setSaldoA(cleanA);
      setSaldoB(cleanB);

      // DETECT OWNER
      const valA = parseInt(cleanA.replace(/[^\d]/g, ""));
      const valB = parseInt(cleanB.replace(/[^\d]/g, ""));

      if (valA > 0) {
        setCurrentOwner("PartyA");
      } else if (valB > 0) {
        setCurrentOwner("PartyB");
      } else {
        setCurrentOwner(""); // nothing active
      }

    } catch (err) {
      setSaldoA("Error");
      setSaldoB("Error");
      setCurrentOwner("");
    } finally {
      setLoadingSaldo(false);
    }
  };


  useEffect(() => {
    fetchSaldo();
  }, []);


  // 🔧 Utility: simpan transaksi ke database / JSON file
  const saveTransaction = async (tx: any) => {
    try {
      await fetch("/api/txHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      });
    } catch (err) {
      console.error("❌ Gagal menyimpan transaksi:", err);
    }
  };

  //Issue
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(issueAmount),
          owner: issueOwner,
        }),
      });

      const data = await res.json().catch(() => null);

      console.log("FE /api/issue status:", res.status);
      console.log("FE /api/issue data:", data);

      const ok =
        data &&
        (data.status === "success" ||
          !!data.txId); // fallback: kalau ada txId, anggap sukses

      setIssueStatus(
        (data && data.message) ||
        (ok ? "Issue berhasil." : "Status tidak diketahui")
      );

      if (ok) {
        toast.success("Issue berhasil!");

        const tx = {
          time: new Date().toISOString(),
          type: "Issue" as const,
          txHash: data.txId,
          index: data.index ?? 0, // kalau BE belum kirim index, default 0
          description: `Issue Rp ${issueAmount} → ${issueOwner}`,
        };

        pushTx(tx);
        await saveTransaction(tx);
      } else {
        toast.error("Issue gagal.");
      }

      await fetchSaldo();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan.");
      setIssueStatus("Gagal issue.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // ---------- TRANSFER ----------
  const handleTransfer = async () => {
    if (!txHash.trim()) {
      toast.error("Mohon isi txHash terlebih dahulu.");
      setTransferStatus("Isi txHash dulu.");
      return;
    }

    if (!txIndex) {
      toast.error("Index state tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    setTransferStatus("Memproses transfer...");
    toast.info("Memproses transfer...");

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: txHash.trim(),
          index: Number(txIndex),     // <--- INDEX BENAR
          newOwner                   // <--- owner baru
        }),
      });

      const data = await res.json();
      setTransferStatus(data.message || "Status tidak diketahui");

      if (data.status === "success") {
        toast.success("Transfer berhasil!");

        // 🔥 Transfer juga return index output baru
        const tx = {
          time: new Date().toISOString(),
          type: "Transfer" as const,
          txHash: data.txId,
          index: data.index,         // <--- SIMPAN INDEX BARU
          description: `${newOwner} menerima kepemilikan`
        };

        pushTx(tx);
        await saveTransaction(tx);
      } else {
        toast.error("Transfer gagal.");
      }

      await fetchSaldo();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan.");
      setTransferStatus("Gagal transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };


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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: redeemAmount,
          issuer: redeemIssuer,
        }),
      });

      const data = await res.json();
      setRedeemStatus(data.message || "Status tidak diketahui");

      if (data.status === "success") {
        toast.success("Redeem berhasil!");

        const tx = {
          time: new Date().toISOString(),
          type: "Redeem" as const,
          txHash: data.txId,
          index: -1,   // <------------------- FIX di sini
          description: `Redeem Rp ${redeemAmount} via ${redeemIssuer}`
        };

        pushTx(tx);
        await saveTransaction(tx);
      } else {
        toast.error("Redeem gagal.");
      }

      await fetchSaldo();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan.");
      setRedeemStatus("Gagal redeem.");
    } finally {
      setIsSubmitting(false);
    }
  };



  const disabled = isSubmitting;

  return (
    <div className="min-h-screen bg-[color:var(--bg-main)] text-main">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top bar */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Corda Rupiah Dashboard
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Simulasi issue, transfer & redeem dengan tampilan banking-grade.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={fetchSaldo}
            loading={loadingSaldo}
            className="text-main self-start md:self-auto"
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
          <div className="glass-card transition-colors p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">1. Issue Uang Baru</h2>
              <p className="text-xs text-muted">
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
              <p className="text-xs text-main bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                {issueStatus}
              </p>
            )}
            <Button onClick={handleIssue} disabled={disabled}>
              Issue
            </Button>
          </div>

          {/* Transfer */}
          <div className="glass-card transition-colors p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">2. Transfer Uang</h2>
              <p className="text-xs text-muted">
                Gunakan txHash hasil issue untuk memindahkan kepemilikan.
              </p>
            </div>
            <Input
              label="txHash"
              placeholder="Hash dari hasil Issue"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
            {/* <Input
              label="Jumlah (Rp)"
              type="number"
              min={0}
              value={txIndex}
              onChange={(e) => setTxIndex(e.target.value)}
            /> */}
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
              <p className="text-xs text-main bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                {transferStatus}
              </p>
            )}
            <Button onClick={handleTransfer} disabled={disabled}>
              Transfer
            </Button>
          </div>

          {/* Redeem */}
          <div className="glass-card transition-colors p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">3. Redeem (Penebusan)</h2>
              <p className="text-xs text-muted">
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
              <p className="text-xs text-main bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                {redeemStatus}
              </p>
            )}
            <Button onClick={handleRedeem} disabled={disabled}>
              Redeem
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
