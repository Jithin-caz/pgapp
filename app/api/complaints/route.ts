// app/api/complaints/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET: Fetch all complaints with tenant details
export async function GET() {
  try {
    const complaints = await sql`
      SELECT c.id, c.title, c.description, c.status, c.created_at, 
             t.name as tenant_name, r.room_number
      FROM complaints c
      JOIN tenants t ON c.tenant_id = t.id
      JOIN rooms r ON t.room_id = r.id
      ORDER BY 
        CASE WHEN c.status = 'open' THEN 1 ELSE 2 END, -- Show open first
        c.created_at DESC
    `;
    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}

// PATCH: Update complaint status
export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    
    await sql`
      UPDATE complaints 
      SET status = ${status}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}