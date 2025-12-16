// app/api/tenant/dashboard/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get tenantId from URL query params (e.g., ?id=123)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // 1. Fetch Tenant Details & Room
    const tenantRes = await sql`
      SELECT t.id, t.name, t.email, r.room_number 
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.id = ${id}
    `;
    
    if (tenantRes.length === 0) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    const tenant = tenantRes[0];

    // 2. Fetch Dues (Pending first)
    const dues = await sql`
      SELECT * FROM dues 
      WHERE tenant_id = ${id} 
      ORDER BY status DESC, generated_at DESC
    `;

    // 3. Fetch Complaints
    const complaints = await sql`
      SELECT * FROM complaints 
      WHERE tenant_id = ${id} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ tenant, dues, complaints });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}