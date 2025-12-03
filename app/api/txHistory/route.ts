// import { NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";

// const filePath = path.join(process.cwd(), "data", "txHistory.json");

// // Pastikan folder data ada
// function ensureDataDir() {
//   const dir = path.dirname(filePath);
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//   if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
// }

// // GET → baca riwayat transaksi
// export async function GET() {
//   ensureDataDir();
//   const data = fs.readFileSync(filePath, "utf-8");
//   return NextResponse.json(JSON.parse(data));
// }

// // POST → tambahkan transaksi baru
// export async function POST(req: Request) {
//   ensureDataDir();
//   const newTx = await req.json();

//   const data = fs.readFileSync(filePath, "utf-8");
//   const txs = JSON.parse(data);

//   txs.unshift({ ...newTx, time: new Date().toISOString() });

//   fs.writeFileSync(filePath, JSON.stringify(txs, null, 2));

//   return NextResponse.json({ status: "ok" });
// }

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// GET → ambil transaksi (dengan filter & pagination)
export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("cordaDashboard");

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // Issue | Transfer | Redeem
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const filter = type && type !== "All" ? { type } : {};

    const [txs, total] = await Promise.all([
      db.collection("transactions")
        .find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("transactions").countDocuments(filter),
    ]);

    return NextResponse.json({ txs, total, page, limit });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengambil data transaksi" },
      { status: 500 }
    );
  }
}

// POST → simpan transaksi baru
export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("cordaDashboard");
    const body = await req.json();

    const doc = {
      ...body,
      time: new Date().toISOString(),
    };

    const result = await db.collection("transactions").insertOne(doc);

    return NextResponse.json({ status: "ok", insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal menyimpan transaksi" },
      { status: 500 }
    );
  }
}
