// This file is no longer needed with the new JWT authentication system.
// It can be safely deleted, but I am keeping it empty to avoid breaking references if any exist.
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Authentication is now handled via /login page.' }, { status: 404 });
}
