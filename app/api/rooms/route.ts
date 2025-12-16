// app/api/rooms/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // We fetch rooms + tenant details + counts of issues in one go
    const data = await sql`
      SELECT 
        r.id, 
        r.room_number, 
        r.status,
        t.id as tenant_id,
        t.name as tenant_name,
        (SELECT COUNT(*)::int FROM dues d WHERE d.tenant_id = t.id AND d.status = 'pending') as due_count,
        (SELECT COUNT(*)::int FROM complaints c WHERE c.tenant_id = t.id AND c.status = 'open') as complaint_count
      FROM rooms r
      LEFT JOIN tenants t ON r.id = t.room_id
      ORDER BY r.id ASC
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}