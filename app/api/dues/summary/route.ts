// app/api/dues/summary/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Pending by Month
    const byMonth = await sql`
      SELECT month, SUM(amount) as total, COUNT(id) as count
      FROM dues 
      WHERE status = 'pending'
      GROUP BY month
      ORDER BY min(generated_at) DESC
    `;

    // 2. Pending by Tenant
    const byTenant = await sql`
      SELECT t.name, t.room_id, r.room_number, SUM(d.amount) as total_due, string_agg(d.month, ', ') as months
      FROM dues d
      JOIN tenants t ON d.tenant_id = t.id
      JOIN rooms r ON t.room_id = r.id
      WHERE d.status = 'pending'
      GROUP BY t.id, t.name, t.room_id, r.room_number
      ORDER BY total_due DESC
    `;

    return NextResponse.json({ byMonth, byTenant });
  } catch (error) {
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}