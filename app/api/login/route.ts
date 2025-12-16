// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db'; // The @ alias usually points to root

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // 1. HARDCODED OWNER CHECK
  const OWNER_EMAIL = process.env.OWNER_EMAIL
  const OWNER_PASS = process.env.OWNER_PASSWORD; 

  if (email === OWNER_EMAIL && password === OWNER_PASS) {
    return NextResponse.json({ 
      role: 'owner', 
      redirect: '/dashboard/owner' 
    });
  }

  // 2. TENANT CHECK (Database)
  try {
    const result = await sql`
      SELECT id, name, email FROM tenants 
      WHERE email = ${email} AND password_hash = ${password}
    `;

    if (result.length > 0) {
      return NextResponse.json({ 
        role: 'tenant', 
        redirect: '/dashboard/tenant',
        user: result[0]
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}