// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. OWNER CHECK (Using Environment Variables)
    if (
      email === process.env.OWNER_EMAIL && 
      password === process.env.OWNER_PASSWORD
    ) {
      return NextResponse.json({ 
        user: {
          id: 0,            // Special ID for owner
          name: 'Property Owner',
          email: email,
          role: 'owner',    // <--- Crucial for ProtectedRoute
        },
        redirect: '/dashboard/owner' 
      });
    }

    // 2. TENANT CHECK (Database)
    // Note: In production, verify hashed passwords. 
    // For this demo, we assume plain text or simple comparison.
    const result = await sql`
      SELECT id, name, email, room_id 
      FROM tenants 
      WHERE email = ${email} AND password_hash = ${password}
    `;

    if (result.length > 0) {
      const tenant = result[0];
      return NextResponse.json({ 
        user: {
          ...tenant,
          role: 'tenant',   // <--- Crucial for ProtectedRoute
        },
        redirect: '/dashboard/tenant',
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}