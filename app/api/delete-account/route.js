import { NextResponse } from "next/server";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body?.email || "").trim().toLowerCase();
    const confirmDelete = Boolean(body?.confirmDelete);

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail || !confirmDelete) {
      return NextResponse.json(
        { ok: false, message: "Please provide a valid email and confirmation." },
        { status: 400 }
      );
    }

    await addDoc(collection(db, "deletion_requests"), {
      email,
      confirmDelete,
      status: "pending",
      createdAt: new Date()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Failed to submit request." },
      { status: 500 }
    );
  }
}
