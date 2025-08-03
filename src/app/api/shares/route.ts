
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function POST(request: Request) {
  console.log('[API] POST /api/shares endpoint hit.');
  try {
    const data = await request.json();
    console.log('[API] Received share data in request body.');

    if (!data.rules || !data.prompts || !data.modifiers) {
      console.error('[API] Invalid share data received.', data);
      return NextResponse.json({ error: 'Invalid share data provided.' }, { status: 400 });
    }

    console.log('[API] Attempting to add document to Firestore using Admin SDK...');
    const docRef = await adminDb.collection('shares').add(data);
    console.log(`[API] Successfully created document in Firestore with ID: ${docRef.id}`);
    
    return NextResponse.json({ id: docRef.id }, { status: 201 });

  } catch (error: any) {
    console.error("[API] An error occurred while creating the share document:", error);
    
    // Check for the specific Firestore "NOT_FOUND" error
    if (error.code === 5) { // 5 is the gRPC code for NOT_FOUND
        return NextResponse.json({ 
            error: 'Firestore database not found. Have you created it in the Firebase Console?',
            details: "The server is authenticated but could not find a Firestore database for this project. Please go to the Firebase Console, select your project, and click 'Create database' in the Firestore Database section."
        }, { status: 500 });
    }

    return NextResponse.json({ error: 'Failed to create share link on server.', details: error.message }, { status: 500 });
  }
}
