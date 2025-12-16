// app/api/tenants/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Destructure deposit from body
    const { name, email, password, phone, roomId, deposit } = await request.json();

    // 2. Include deposit in the INSERT query
    await sql.transaction([
      sql`
        INSERT INTO tenants (name, email, password_hash, phone, room_id, deposit) 
        VALUES (${name}, ${email}, ${password}, ${phone}, ${roomId}, ${deposit})
      `,
      sql`UPDATE rooms SET status = 'occupied' WHERE id = ${roomId}`
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error adding tenant' }, { status: 500 });
  }
}