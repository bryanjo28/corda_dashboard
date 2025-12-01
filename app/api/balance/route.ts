import { NextResponse } from "next/server";

const API_A = "http://localhost:8080/api/rupiah";
const API_B = "http://localhost:8081/api/rupiah";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bank = searchParams.get("bank");

  const url = bank === "A" ? `${API_A}/balance` : `${API_B}/balance`;

  try {
    const saldo = await fetch(url).then((r) => r.text());
    return NextResponse.json(saldo);
  } catch (err) {
    return NextResponse.json("Error", { status: 500 });
  }
}