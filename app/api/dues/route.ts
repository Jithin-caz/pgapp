// app/api/dues/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { tenantId, amount, month, dueDate } = await request.json();

    await sql`
      INSERT INTO dues (tenant_id, amount, month, due_date, status)
      VALUES (${tenantId}, ${amount}, ${month}, ${dueDate}, 'pending')
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add due' }, { status: 500 });
  }
}