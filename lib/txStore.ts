"use client";

import { create } from "zustand";

export type TxType = "Issue" | "Transfer" | "Redeem";

export interface TxRow {
  id: number;
  time: string;
  type: TxType;
  txHash: string;
  description: string;
  index?: number;
  amount?: number;
  owner?: string;
  participants?: string[];
  newOwnerIndex?: number | null;
  remainingOwnerIndex?: number | null;
}

interface TxStore {
  txs: TxRow[];
  pushTx: (tx: Omit<TxRow, "id">) => void;
}

export const useTxStore = create<TxStore>((set) => ({
  txs: [],

  pushTx: (tx) =>
    set((state) => ({
      txs: [
        {
          id: state.txs.length + 1,
          ...tx,
        },
        ...state.txs,
      ],
    })),
}));
