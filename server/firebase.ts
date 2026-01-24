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

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  initialized = true;
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
