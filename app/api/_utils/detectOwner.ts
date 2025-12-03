import { CordaAPI } from "../_config/corda";

export async function detectOwner(txHash: string, index: number) {
  for (const bank of ["A", "B", "C"] as const) {
    try {
      const url = `${CordaAPI[bank]}/owner?txHash=${encodeURIComponent(
        txHash
      )}&index=${index}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.owner === `Party${bank}`) {
        return `Party${bank}`;
      }
    } catch {}
  }

  return null;
}
