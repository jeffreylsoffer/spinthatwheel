
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'No ID provided.' }, { status: 400 });
    }

    const docRef = doc(db, 'shares', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Share link not found.' }, { status: 404 });
    }

    return NextResponse.json(docSnap.data(), { status: 200 });

  } catch (error) {
    console.error(`Error fetching share document with ID: ${params.id}`, error);
    return NextResponse.json({ error: 'Failed to fetch share data from server.' }, { status: 500 });
  }
}
