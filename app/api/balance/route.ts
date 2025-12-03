import { NextResponse } from "next/server";
import { getNode } from "../_config/corda";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bank = searchParams.get("bank") as any;

  if (!bank || !["A", "B", "C"].includes(bank)) {
    return NextResponse.json(
      { error: "bank must be A, B, or C" },
      { status: 400 }
    );
  }

  const url = `${getNode(bank)}/balance`;

  try {
    const saldo = await fetch(url).then((r) => r.text());
    return NextResponse.json({ balance: saldo });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Balance lookup failed" }, { status: 500 });
  }
}
