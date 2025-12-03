import { NextResponse } from "next/server";
import { getNode } from "../_config/corda";

export async function POST(req: Request) {
  const { amount, issuer, bank } = await req.json();

  if (!bank || !["A", "B", "C"].includes(bank)) {
    return NextResponse.json(
      { error: "bank must be A, B, or C" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${getNode(bank)}/redeem?amount=${amount}&issuer=${encodeURIComponent(
        issuer
      )}`,
      { method: "POST" }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Redeem error:", err);
    return NextResponse.json(
      { error: "Redeem failed" },
      { status: 500 }
    );
  }
}
