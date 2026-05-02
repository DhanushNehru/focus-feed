import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const rules = await sql`SELECT * FROM rules ORDER BY created_at DESC`;
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { type, value } = await request.json();
    if (!['include', 'exclude'].includes(type) || !value) {
      return NextResponse.json({ error: 'Invalid rule type or value' }, { status: 400 });
    }
    
    const id = uuidv4();
    await sql`
      INSERT INTO rules (id, type, value) 
      VALUES (${id}, ${type}, ${value})
    `;
    
    return NextResponse.json({ id, type, value }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add rule' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM rules WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
