import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const rules = db.prepare('SELECT * FROM rules ORDER BY created_at DESC').all();
  return NextResponse.json(rules);
}

export async function POST(request) {
  try {
    const { type, value } = await request.json();
    if (!['include', 'exclude'].includes(type) || !value) {
      return NextResponse.json({ error: 'Invalid rule type or value' }, { status: 400 });
    }
    
    const id = uuidv4();
    db.prepare('INSERT INTO rules (id, type, value) VALUES (?, ?, ?)').run(id, type, value);
    
    return NextResponse.json({ id, type, value }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add rule' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    db.prepare('DELETE FROM rules WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
