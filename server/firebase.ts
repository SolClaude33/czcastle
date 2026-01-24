import admin from "firebase-admin";

let initialized = false;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
}

function initFirebaseAdmin() {
  if (initialized || admin.apps.length) {
    initialized = true;
    return;
  }

  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.",
    );
  }

  try {
    // Handle PRIVATE_KEY format - Vercel may store it with escaped newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
    
    // Replace escaped newlines (\\n) with actual newlines
    privateKey = privateKey.replace(/\\n/g, "\n");
    
    // If the key is wrapped in quotes, remove them
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
        (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
      // Replace escaped newlines again after removing quotes
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    initialized = true;
    console.log("[Firebase Admin] Initialized successfully");
  } catch (error) {
    console.error("[Firebase Admin] Initialization error:", error);
    throw error;
  }
}

export function getAdminAuth() {
  initFirebaseAdmin();
  return admin.auth();
}

export function getAdminDb() {
  initFirebaseAdmin();
  return admin.firestore();
}

export default admin;
