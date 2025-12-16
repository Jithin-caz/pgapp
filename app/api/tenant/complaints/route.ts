// app/api/tenant/complaints/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { tenantId, title, description } = await request.json();

    await sql`
      INSERT INTO complaints (tenant_id, title, description, status)
      VALUES (${tenantId}, ${title}, ${description}, 'open')
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to raise complaint' }, { status: 500 });
  }
}