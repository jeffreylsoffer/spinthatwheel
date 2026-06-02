import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.rules || !data.prompts || !data.modifiers) {
      return NextResponse.json({ error: 'Invalid share data provided.' }, { status: 400 });
    }

    const id = crypto.randomBytes(10).toString('hex');
    await redis.set(`share:${id}`, JSON.stringify(data));

    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Failed to create share link.', details: error.message }, { status: 500 });
  }
}
