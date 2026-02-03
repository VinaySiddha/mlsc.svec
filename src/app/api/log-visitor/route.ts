import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { z } from 'zod';

const visitorSchema = z.object({
    ip: z.string(),
    userAgent: z.string(),
    path: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = visitorSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Fire and forget - verify db exists (it might fail if env vars are wrong)
        if (db) {
            await addDoc(collection(db, 'visitors'), {
                ...parsed.data,
                timestamp: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error logging visitor:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
