"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { useToast } from "@/components/toast/useToast";
import { useTxStore } from "@/lib/txStore";
import { Session } from "next-auth";

type Bank = "A" | "B" | "C";

interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const toast = useToast();

  const bank = session.user.bank;
  const isBankA = bank === "A";
  const transferTargets = useMemo(
    () => (isBankA ? ["PartyB", "PartyC"] : ["PartyA", "PartyB", "PartyC"]),
    [isBankA]
  );
  const issueTargets = ["PartyB", "PartyC"];
  const redeemTargets = ["PartyA"];
  const canRedeem = bank !== "A";

  const [saldoA, setSaldoA] = useState<string>("...");
  const [saldoB, setSaldoB] = useState<string>("...");
  const [saldoC, setSaldoC] = useState<string>("...");
  const [loadingSaldo, setLoadingSaldo] = useState<boolean>(false);

  const [issueAmount, setIssueAmount] = useState("1000");
  const [issueOwner, setIssueOwner] = useState(issueTargets[0]);
  const [issueStatus, setIssueStatus] = useState<string>("");

  const [txHash, setTxHash] = useState("");
  const [txIndex, setTxIndex] = useState("0");
  const [newOwner, setNewOwner] = useState(transferTargets[0]);
  const [transferAmount, setTransferAmount] = useState("100");
  const [transferStatus, setTransferStatus] = useState<string>("");

  const [redeemAmount, setRedeemAmount] = useState("100");
  const [redeemIssuer, setRedeemIssuer] = useState(redeemTargets[0]);
  const [redeemStatus, setRedeemStatus] = useState<string>("");

  const { pushTx } = useTxStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatBalance = (raw: any) => {
    const num =
      typeof raw === "number"
        ? raw
        : parseInt(String(raw).replace(/[^\d]/g, ""), 10) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // ---------- Fetch Saldo ----------
  const fetchSaldo = async () => {
    try {
      setLoadingSaldo(true);

      const fetchBank = async (code: Bank) => {
        const res = await fetch(`/api/balance?bank=${code}`);
        const data = await res.json();
        return formatBalance(data.balance);
      };

      if (isBankA) {
        const [a, b, c] = await Promise.all([
          fetchBank("A"),
          fetchBank("B"),
          fetchBank("C"),
        ]);
        setSaldoA(a);
        setSaldoB(b);
        setSaldoC(c);
      } else {
        const own = await fetchBank(bank);
        if (bank === "B") {
          setSaldoB(own);
          setSaldoA("—");
          setSaldoC("—");
        } else {
          setSaldoC(own);
          setSaldoA("—");
          setSaldoB("—");
        }
      }
    } catch (err) {
      setSaldoA("Error");
      setSaldoB("Error");
      setSaldoC("Error");
    } finally {
      setLoadingSaldo(false);
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  // Utility: simpan transaksi ke database / JSON file
  const saveTransaction = async (tx: any) => {
    try {
      await fetch("/api/txHistory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tx, bank }),
      });
    } catch (err) {
      console.error("Gagal menyimpan transaksi:", err);
    }
  };

  // Issue
  const handleIssue = async () => {
    if (!isBankA) {
      toast.error("Hanya Bank A yang bisa melakukan issue.");
      return;
    }

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

      const ok =
        data &&
        (data.status === "success" || !!data.txId);

      setIssueStatus(
        (data && data.message) || (ok ? "Issue berhasil." : "Status tidak diketahui")
      );

      if (ok) {
        toast.success("Issue berhasil!");

        const targetBank = issueOwner.replace("Party", "");
        const tx = {
          time: new Date().toISOString(),
          type: "Issue" as const,
          txHash: data.txId,
          index: data.index ?? 0,
          description: `Issue Rp ${issueAmount} ke ${issueOwner}`,
          owner: targetBank,
          participants: ["A", targetBank],
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
    if (!transferTargets.includes(newOwner)) {
      toast.error("Tujuan transfer tidak diizinkan untuk bank ini.");
      return;
    }

    if (!txHash.trim()) {
      toast.error("Mohon isi txHash terlebih dahulu.");
      setTransferStatus("Isi txHash dulu.");
      return;
    }

    if (!txIndex) {
      toast.error("Index state tidak ditemukan.");
      return;
    }

    if (!transferAmount || Number(transferAmount) <= 0) {
      toast.error("Jumlah transfer tidak valid.");
      setTransferStatus("Jumlah transfer tidak valid.");
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
          index: Number(txIndex),
          newOwner,
          amount: Number(transferAmount),
        }),
      });

      const data = await res.json();
      const newOwnerIndex =
        data.newOwnerIndex !== undefined ? Number(data.newOwnerIndex) : undefined;
      const remainingOwnerIndex =
        data.remainingOwnerIndex !== undefined
          ? Number(data.remainingOwnerIndex)
          : undefined;
      const statusDetails =
        newOwnerIndex !== undefined
          ? ` (Index penerima: ${newOwnerIndex}${
              remainingOwnerIndex !== undefined ? `, Index sisa: ${remainingOwnerIndex}` : ""
            })`
          : "";
      setTransferStatus((data.message || "Status tidak diketahui") + statusDetails);

      if (data.status === "success") {
        toast.success("Transfer berhasil!");

        const targetBank = newOwner.replace("Party", "");
        const tx = {
          time: new Date().toISOString(),
          type: "Transfer" as const,
          txHash: data.txId,
          index: newOwnerIndex ?? 0,
          amount: Number(transferAmount),
          newOwnerIndex: newOwnerIndex ?? null,
          remainingOwnerIndex: remainingOwnerIndex ?? null,
          description: `Transfer Rp ${transferAmount} ke ${newOwner}${
            remainingOwnerIndex !== undefined
              ? ` (sisa untuk pengirim di index ${remainingOwnerIndex})`
              : ""
          }`,
          owner: targetBank,
          participants: [bank, targetBank],
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
    if (!redeemTargets.includes(redeemIssuer)) {
      toast.error("Redeem hanya bisa ke Bank A.");
      return;
    }

    if (!redeemAmount || Number(redeemAmount) <= 0) {
      toast.error("Jumlah redeem tidak valid.");
      return;
    }

    if (!canRedeem) {
      toast.error("Redeem hanya untuk Bank B atau C.");
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
          bank,
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
          index: -1,
          description: `Redeem Rp ${redeemAmount} via ${redeemIssuer}`,
          owner: "A",
          participants: [bank, "A"],
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
        <section
          className={`grid grid-cols-1 ${isBankA ? "md:grid-cols-3" : "md:grid-cols-1"} gap-5 mb-8`}
        >
          {isBankA && (
            <>
              <Card title="Bank A" subtitle="Issuer / Notary" value={saldoA} accent="A" />
              <Card title="Bank B" subtitle="Beneficiary" value={saldoB} accent="B" />
              <Card title="Bank C" subtitle="Beneficiary" value={saldoC} accent="C" />
            </>
          )}
          {!isBankA && bank === "B" && (
            <Card title="Bank B" subtitle="Beneficiary" value={saldoB} accent="B" />
          )}
          {!isBankA && bank === "C" && (
            <Card title="Bank C" subtitle="Beneficiary" value={saldoC} accent="C" />
          )}
        </section>

        {/* Action panels */}
        <section
          className={`grid grid-cols-1 ${isBankA ? "lg:grid-cols-1" : "lg:grid-cols-2"} gap-6 mb-8`}
        >
          {/* Issue hanya untuk Bank A */}
          {isBankA && (
            <div className="glass-card transition-colors p-5 flex flex-col gap-4 lg:col-span-1">
              <div>
                <h2 className="text-lg font-semibold">1. Issue Uang Baru</h2>
                <p className="text-xs text-muted">
                  Bank A menerbitkan rupiah digital ke Bank B atau C.
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
                options={issueTargets.map((val) => ({
                  value: val,
                  label: `Bank ${val.replace("Party", "")}`,
                }))}
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
          )}

          {/* Transfer hanya muncul untuk B/C */}
          {!isBankA && (
            <div className="glass-card transition-colors p-5 flex flex-col gap-4 lg:col-span-2">
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
              <Input
                label="Index State"
                type="number"
                min={0}
                value={txIndex}
                onChange={(e) => setTxIndex(e.target.value)}
              />
              <Input
                label="Jumlah Transfer (Rp)"
                type="number"
                min={1}
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <Select
                label="Pemilik Baru"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                options={transferTargets.map((val) => ({
                  value: val,
                  label: `Bank ${val.replace("Party", "")}`,
                }))}
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
          )}

          {/* Redeem hanya muncul untuk B/C */}
          {!isBankA && (
            <div className="glass-card transition-colors p-5 flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">3. Redeem (Penebusan)</h2>
                <p className="text-xs text-muted">
                  Bank B/C menebus saldo kembali ke Bank A sebagai issuer.
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
                options={redeemTargets.map((val) => ({
                  value: val,
                  label: `Bank ${val.replace("Party", "")} (Issuer)`,
                }))}
              />
              {redeemStatus && (
                <p className="text-xs text-main bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700/70">
                  {redeemStatus}
                </p>
              )}
              <Button onClick={handleRedeem} disabled={disabled || !canRedeem}>
                Redeem
              </Button>
              {!canRedeem && (
                <p className="text-xs text-muted">
                  Redeem hanya bisa dilakukan oleh Bank B atau C ke Bank A.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
