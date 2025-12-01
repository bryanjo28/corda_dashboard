import { NextResponse } from "next/server";

const API_A = "http://localhost:8080/api/rupiah";

export async function POST(req: Request) {
  const { amount, owner } = await req.json();

  try {
    const res = await fetch(
      `${API_A}/issue?amount=${amount}&owner=${encodeURIComponent(owner)}`,
      { method: "POST" }
    ).then((r) => r.text());

    return new Response(res);
  } catch (err) {
    return NextResponse.json("Issue failed", { status: 500 });
  }
}
