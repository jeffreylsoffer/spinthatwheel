import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

// Sorted set used as a chronological index of all shares (newest = highest score).
// Existing shares created before this index won't appear here, but still load fine by id.
const SHARE_INDEX_KEY = 'shares:index';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.rules || !data.prompts || !data.modifiers) {
      return NextResponse.json({ error: 'Invalid share data provided.' }, { status: 400 });
    }

    const id = crypto.randomBytes(10).toString('hex');
    const createdAt = Date.now();

    // Non-breaking: createdAt is an extra field the game loader simply ignores.
    await redis.set(`share:${id}`, JSON.stringify({ ...data, createdAt }));
    // Index by creation time so admins can list newest shares. Best-effort —
    // a failure here must not break share creation.
    try {
      await redis.zadd(SHARE_INDEX_KEY, { score: createdAt, member: id });
    } catch (indexError) {
      console.error('Failed to add share to index (non-fatal):', indexError);
    }

    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Failed to create share link.', details: error.message }, { status: 500 });
  }
}
