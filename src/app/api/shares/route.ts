
import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation to ensure we're getting what we expect
    if (!data.rules || !data.prompts || !data.modifiers) {
      return NextResponse.json({ error: 'Invalid share data provided.' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'shares'), data);
    
    return NextResponse.json({ id: docRef.id }, { status: 201 });

  } catch (error) {
    console.error("Error creating share document:", error);
    return NextResponse.json({ error: 'Failed to create share link on server.' }, { status: 500 });
  }
}
