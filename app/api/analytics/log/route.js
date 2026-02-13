import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure this server-side firebase init works or use admin SDK

// Note: In a production environment, you should use the Firebase Admin SDK for server-side operations
// to bypass client-side security rules and for better performance.
// For this prototype, we'll assume the client SDK is sufficient or this route is just a placeholder interface.

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      event_type, // 'play_start', 'play_stop', 'purchase'
      movie_id,
      user_id,
      timestamp,
      metadata 
    } = body;

    // Validate required fields
    if (!event_type || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // specific handling based on event type
    let logEntry = {
      event_type,
      user_id,
      timestamp: timestamp || new Date().toISOString(),
      created_at: serverTimestamp(), // Firestore server timestamp
      ...metadata
    };

    if (event_type === 'play_stop') {
      // Calculate completion percentage if duration and position are provided
      if (metadata?.duration && metadata?.position) {
        logEntry.completion_percent = (metadata.position / metadata.duration) * 100;
      }
    }

    // In a real app, you might write to a 'analytics_logs' collection
    // await addDoc(collection(db, "analytics_logs"), logEntry);
    
    // For now, we'll just log to console to simulate the pipeline
    console.log("Analytics Log Received:", logEntry);

    return NextResponse.json({ success: true, message: "Log received" });
  } catch (error) {
    console.error("Error logging analytics:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
