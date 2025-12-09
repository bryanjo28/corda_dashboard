import { NextResponse } from "next/server";
import { CordaAPI } from "../_config/corda";

export async function POST(req: Request) {
  const { txHash, index, amount, newOwner, bank } = await req.json();

  if (!txHash || index === undefined || amount === undefined || !newOwner) {
    return NextResponse.json(
      { status: "error", message: "txHash, index, amount, dan newOwner wajib diisi" },
      { status: 400 }
    );
  }

  if (!bank || !["A", "B", "C"].includes(bank)) {
    return NextResponse.json(
      { status: "error", message: "bank wajib (B/C)" },
      { status: 400 }
    );
  }

  if (bank === "A") {
    return NextResponse.json(
      { status: "error", message: "Partial transfer hanya untuk Bank B atau C" },
      { status: 400 }
    );
  }

  const apiBase = CordaAPI[bank];

  try {
    const res = await fetch(
      `${apiBase}/transfer-partial?txHash=${encodeURIComponent(
        txHash
      )}&index=${Number(index)}&amount=${Number(amount)}&newOwner=${encodeURIComponent(
        newOwner
      )}`,
      { method: "POST" }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Partial transfer error:", err);
    return NextResponse.json(
      { status: "error", message: "Partial transfer failed" },
      { status: 500 }
    );
  }
}
