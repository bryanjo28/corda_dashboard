import { NextResponse } from "next/server";

const API_A = "http://localhost:8080/api/rupiah";

export async function POST(req: Request) {
  const { amount, owner } = await req.json();

  try {
    const res = await fetch(
      `${API_A}/issue?amount=${amount}&owner=${encodeURIComponent(owner)}`,
      { method: "POST" }
    );

    // Coba parse JSON; kalau gagal, anggap error
    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {
      console.error("Failed to parse JSON from Corda /issue:", e);
    }

    // DEBUG (sementara): lihat apa yang sebenarnya balik
    console.log("Corda /issue HTTP:", res.status);
    console.log("Corda /issue body:", data);

    // Kalau backend kirim { status: "success", ... }
    if (data?.status === "success") {
      return NextResponse.json(data, { status: 200 });
    }

    // Kalau ada txId tapi tanpa status, tetap anggap sukses
    if (data?.txId) {
      return NextResponse.json(
        { ...data, status: "success" },
        { status: 200 }
      );
    }

    // Selain itu anggap error
    return NextResponse.json(
      data || { status: "error", message: "Issue failed at Corda node" },
      { status: res.ok ? 500 : res.status || 500 }
    );
  } catch (err) {
    console.error("Issue error (proxy /api/issue):", err);
    return NextResponse.json(
      { status: "error", message: "Issue failed (proxy error)" },
      { status: 500 }
    );
  }
}

