// app/api/tenants/[id]/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;

    // 1. Fetch Basic Tenant Info & Room
    const tenantResult = await sql`
      SELECT t.id, t.name, t.email, t.phone, t.joined_at, r.room_number, r.id as room_id
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
    return NextResponse.json({ error: 'Database Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id;

    // Transaction: 
    // 1. Get room_id to free it up
    // 2. Delete tenant (Cascade will handle dues/complaints if set, but we also update room)
    // 3. Set room status to available
    
    await sql.transaction(async (tx) => {
        // Get the room ID first
        const t = await tx`SELECT room_id FROM tenants WHERE id = ${tenantId}`;
        const roomId = t[0]?.room_id;

        // Delete the tenant
        await tx`DELETE FROM tenants WHERE id = ${tenantId}`;

        // Free up the room
        if (roomId) {
            await tx`UPDATE rooms SET status = 'available', current_occupancy = 0 WHERE id = ${roomId}`;
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tenant' }, { status: 500 });
  }
}