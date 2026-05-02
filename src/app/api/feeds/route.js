import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { fetchAndParseFeed } from '@/lib/feedParser';

export async function GET() {
  try {
    const feeds = await sql`SELECT * FROM feeds ORDER BY created_at DESC`;
    return NextResponse.json(feeds);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    
    // Validate feed
    const parsedFeed = await fetchAndParseFeed(url);
    const title = parsedFeed.title || url;

    const id = uuidv4();
    
    await sql`
      INSERT INTO feeds (id, url, name) 
      VALUES (${id}, ${url}, ${title})
    `;
    
    return NextResponse.json({ id, url, name: title }, { status: 201 });
  } catch (error) {
    console.error('Failed to add feed:', error);
    if (error.code === '23505') { // Postgres unique constraint violation
        return NextResponse.json({ error: 'Feed already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add or parse feed' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    // Delete articles first due to foreign key
    await sql`DELETE FROM articles WHERE feed_id = ${id}`;
    await sql`DELETE FROM feeds WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 });
  }
}
