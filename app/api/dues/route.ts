// app/api/dues/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Due ID is required' }, { status: 400 });
    }

    await sql`
      UPDATE dues 
      SET status = 'paid' 
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating due:', error);
    return NextResponse.json({ error: 'Failed to update due' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tenantId, amount, month, dueDate } = body;

    // 1. Validate Inputs
    if (!tenantId || !amount || !month || !dueDate) {
      console.error("Missing fields:", body);
      return NextResponse.json(
        { error: 'Missing required fields (tenantId, amount, month, dueDate)' }, 
        { status: 400 }
      );
    }

    // 2. Ensure types are correct for the database
    // HTML input type="number" sends a string "5000", Postgres is usually fine with this,
    // but explicit parsing prevents edge cases.
    const amountNum = parseFloat(amount);
    const tenantIdNum = parseInt(tenantId);

    if (isNaN(amountNum) || isNaN(tenantIdNum)) {
       return NextResponse.json({ error: 'Invalid number format' }, { status: 400 });
    }

    // 3. Insert
    await sql`
      INSERT INTO dues (tenant_id, amount, month, due_date, status)
      VALUES (${tenantIdNum}, ${amountNum}, ${month}, ${dueDate}, 'pending')
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    // 4. Log the ACTUAL error to your terminal so you can see it
    console.error('API Error adding due:', error);
    return NextResponse.json({ error: 'Failed to add due' }, { status: 500 });
  }
}