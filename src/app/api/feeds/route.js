import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { fetchAndParseFeed } from '@/lib/feedParser';

export async function GET() {
  const feeds = db.prepare('SELECT * FROM feeds ORDER BY created_at DESC').all();
  return NextResponse.json(feeds);
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    // Validate feed
    const parsedFeed = await fetchAndParseFeed(url);
    const title = parsedFeed.title || url;

    const id = uuidv4();
    
    db.prepare('INSERT INTO feeds (id, url, name) VALUES (?, ?, ?)').run(id, url, title);
    
    return NextResponse.json({ id, url, name: title }, { status: 201 });
  } catch (error) {
    console.error('Failed to add feed:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return NextResponse.json({ error: 'Feed already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add or parse feed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    // Delete articles first due to foreign key
    db.prepare('DELETE FROM articles WHERE feed_id = ?').run(id);
    db.prepare('DELETE FROM feeds WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 });
  }
}
