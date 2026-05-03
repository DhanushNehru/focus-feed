import { NextResponse } from 'next/server';
import sql, { ensureDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureDb();
    const rules = await sql`SELECT * FROM user_rules WHERE user_email = ${session.user.email} ORDER BY created_at DESC`;
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureDb();
    const { type, value } = await request.json();
    if (!['include', 'exclude'].includes(type) || !value) {
      return NextResponse.json({ error: 'Invalid rule type or value' }, { status: 400 });
    }
    
    const id = uuidv4();
    await sql`
      INSERT INTO user_rules (id, type, value, user_email) 
      VALUES (${id}, ${type}, ${value}, ${session.user.email})
    `;
    
    return NextResponse.json({ id, type, value }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add rule' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureDb();
    const { id } = await request.json();
    await sql`DELETE FROM user_rules WHERE id = ${id} AND user_email = ${session.user.email}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
