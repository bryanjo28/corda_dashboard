import { NextResponse } from "next/server";
import { CordaAPI } from "../_config/corda";
import { detectOwner } from "../_utils/detectOwner";

export async function POST(req: Request) {
  const { txHash, index, newOwner } = await req.json();

  const owner = await detectOwner(txHash, index);

  if (!owner) {
    return NextResponse.json(
      { status: "error", message: "Owner state tidak ditemukan" },
      { status: 400 }
    );
  }

  const bank = owner.replace("Party", "") as "A" | "B" | "C";
  const apiBase = CordaAPI[bank];

  try {
    const res = await fetch(
      `${apiBase}/transfer?txHash=${encodeURIComponent(
        txHash
      )}&index=${index}&newOwner=${encodeURIComponent(newOwner)}`,
      { method: "POST" }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Transfer error:", err);
    return NextResponse.json(
      { status: "error", message: "Transfer failed" },
      { status: 500 }
    );
  }
}
