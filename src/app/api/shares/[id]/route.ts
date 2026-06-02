import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'No ID provided.' }, { status: 400 });
    }

    const data = await redis.get(`share:${id}`);
    if (!data) {
      return NextResponse.json({ error: 'Share link not found.' }, { status: 404 });
    }

    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return NextResponse.json(parsed, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching share ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch share data.' }, { status: 500 });
  }
}
