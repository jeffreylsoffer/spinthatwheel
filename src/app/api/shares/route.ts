
import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: Request) {
  console.log('[API] POST /api/shares endpoint hit.');
  try {
    const data = await request.json();
    console.log('[API] Received share data in request body.');

    // Basic validation
    if (!data.rules || !data.prompts || !data.modifiers) {
      console.error('[API] Invalid share data received.', data);
      return NextResponse.json({ error: 'Invalid share data provided.' }, { status: 400 });
    }

    console.log('[API] Attempting to add document to Firestore...');
    const docRef = await addDoc(collection(db, 'shares'), data);
    console.log(`[API] Successfully created document in Firestore with ID: ${docRef.id}`);
    
    return NextResponse.json({ id: docRef.id }, { status: 201 });

  } catch (error) {
    console.error("[API] An error occurred while creating the share document:", error);
    return NextResponse.json({ error: 'Failed to create share link on server.', details: (error as Error).message }, { status: 500 });
  }
}
