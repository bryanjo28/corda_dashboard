"use client";

import { create } from "zustand";

export interface Utxo {
  txHash: string;
  index: number;
  amount: number;
}

interface UtxoStore {
  utxos: Utxo[];
  setUtxos: (list: Utxo[]) => void;
  addUtxo: (u: Utxo) => void;
  removeUtxo: (txHash: string, index: number) => void;
  reset: () => void;
}

export const useUtxoStore = create<UtxoStore>((set) => ({
  utxos: [],

  setUtxos: (list) => set({ utxos: list }),

  addUtxo: (u) =>
    set((state) => ({
      utxos: [...state.utxos, u],
    })),

  removeUtxo: (txHash, index) =>
    set((state) => ({
      utxos: state.utxos.filter(
        (x) => !(x.txHash === txHash && x.index === index)
      ),
    })),

  reset: () => set({ utxos: [] }),
}));
