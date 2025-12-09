// src/app/api/merge/route.ts
import { NextResponse } from "next/server";

const API_B = "http://localhost:8081/api/rupiah";
const API_C = "http://localhost:8082/api/rupiah";

export async function POST(req: Request) {
  const { bank, issuer } = await req.json(); // bank: "B" | "C"

  const base = bank === "B" ? API_B : API_C;

  try {
    const res = await fetch(
      `${base}/merge?issuer=${encodeURIComponent(issuer)}`,
      { method: "POST" }
    );

    const txt = await res.text();
    return NextResponse.json(
      { status: res.ok ? "success" : "error", message: txt },
      { status: res.status }
    );
  } catch (e) {
    return NextResponse.json(
      { status: "error", message: "Merge failed" },
      { status: 500 }
    );
  }
}
