// app/api/tenants/[id]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; 
    const tenantId = id;

    // 1. Fetch Basic Tenant Info & Room (Added t.deposit here)
    const tenantResult = await sql`
      SELECT 
        t.id, 
        t.name, 
        t.email, 
        t.phone, 
        t.deposit, 
        t.joined_at, 
        r.room_number, 
        r.id as room_id
      FROM tenants t
      LEFT JOIN rooms r ON t.room_id = r.id
      WHERE t.id = ${tenantId}
    `;

    if (tenantResult.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenant = tenantResult[0];

    // 2. Fetch Dues History
    const dues = await sql`
      SELECT * FROM dues 
      WHERE tenant_id = ${tenantId} 
      ORDER BY generated_at DESC
    `;

    // 3. Fetch Complaints History
    const complaints = await sql`
      SELECT * FROM complaints 
      WHERE tenant_id = ${tenantId} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ tenant, dues, complaints });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = id;

    // Transaction: Delete tenant and free up room
    await sql`
      WITH deleted_tenant AS (
        DELETE FROM tenants 
        WHERE id = ${tenantId} 
        RETURNING room_id
      )
      UPDATE rooms 
      SET status = 'available', current_occupancy = 0
      FROM deleted_tenant
      WHERE rooms.id = deleted_tenant.room_id
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}