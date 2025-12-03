/**
 * Seed default users ke MongoDB
 * 
 * User:
 *  - Bank Indonesia (A)
 *  - BCA (B)
 *  - Mandiri (C)
 */

import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

// Ubah sesuai .env kamu
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("corda");
  const usersCol = db.collection("users");

  const users = [
    { username: "bi_admin", password: "bi123", bank: "A" },
    { username: "bca_admin", password: "bca123", bank: "B" },
    { username: "mandiri_admin", password: "mandiri123", bank: "C" },
  ];

  for (const u of users) {
    // Cek apakah sudah ada
    const exists = await usersCol.findOne({ username: u.username });
    if (exists) {
      console.log(`⚠️ User '${u.username}' sudah ada, skip.`);
      continue;
    }

    // Hash password
    const hashed = await bcrypt.hash(u.password, 10);

    // Insert user
    await usersCol.insertOne({
      username: u.username,
      password: hashed,
      bank: u.bank,
      createdAt: new Date(),
    });

    console.log(`✅ User '${u.username}' berhasil ditambahkan.`);
  }

  console.log("\n🎉 Selesai seeding user ke MongoDB.");
  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
