// app/api/tenants/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, roomId } = await request.json();

    // Transaction: 1. Create Tenant, 2. Update Room Status
    await sql.transaction([
      sql`INSERT INTO tenants (name, email, password_hash, phone, room_id) VALUES (${name}, ${email}, ${password}, ${phone}, ${roomId})`,
      sql`UPDATE rooms SET status = 'occupied' WHERE id = ${roomId}`
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error adding tenant' }, { status: 500 });
  }
}