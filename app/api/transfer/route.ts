import { NextResponse } from "next/server";

const API_A = "http://localhost:8080/api/rupiah";

export async function POST(req: Request) {
  const { txHash, index, newOwner } = await req.json();

  try {
    const res = await fetch(
      `${API_A}/transfer?txHash=${txHash}&index=${index}&newOwner=${encodeURIComponent(newOwner)}`,
      { method: "POST" }
    ).then((r) => r.text());

    return new Response(res);
  } catch (err) {
    return NextResponse.json("Transfer failed", { status: 500 });
  }
}
