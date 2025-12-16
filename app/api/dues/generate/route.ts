// app/api/dues/generate/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    const today = new Date();
    // Logic: Allow generation only in first 5 days (Server-side validation)
    // You can comment this out if you want to test it anytime
    if (today.getDate() > 5) {
       return NextResponse.json({ error: 'Rent can only be generated in the first 5 days' }, { status: 403 });
    }

    const currentMonth = today.toLocaleString('default', { month: 'long', year: 'numeric' }); // e.g. "December 2025"
    
    // SQL Logic: 
    // 1. Select all active tenants
    // 2. Check if a due for 'currentMonth' already exists for them
    // 3. Insert only if it doesn't exist to prevent double billing
    // 4. Default rent amount is hardcoded as 5000 (You can add a 'rent_amount' column to tenants table later)
    
    await sql`
      INSERT INTO dues (tenant_id, amount, month, due_date, status)
      SELECT id, 5000, ${currentMonth}, ${today}, 'pending'
      FROM tenants
      WHERE id NOT IN (
        SELECT tenant_id FROM dues WHERE month = ${currentMonth}
      )
    `;

    return NextResponse.json({ success: true, month: currentMonth });
  } catch (error) {
    console.error('Rent Gen Error:', error);
    return NextResponse.json({ error: 'Failed to generate rent' }, { status: 500 });
  }
}