import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { address, payments } = req.body;
  if (!address || !payments) {
    return res.status(400).json({ error: "Missing address or payments" });
  }
  try {
    const client = await clientPromise;
    const db = client.db("Lockup");
    await db
      .collection("intermediaries")
      .updateOne({ address }, { $set: { payments } }, { upsert: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }
}
