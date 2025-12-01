import { NextResponse } from "next/server";

const API_B = "http://localhost:8081/api/rupiah";

export async function POST(req: Request) {
  const { amount, issuer } = await req.json();

  try {
    const res = await fetch(
      `${API_B}/redeem?amount=${amount}&issuer=${encodeURIComponent(issuer)}`,
      { method: "POST" }
    ).then((r) => r.text());

    return new Response(res);
  } catch (err) {
    return NextResponse.json("Redeem failed", { status: 500 });
  }
}
