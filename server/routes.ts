import type { Express } from "express";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  getAdminAuth,
  getAdminDb,
  isFirebaseConfigured,
} from "./firebase";

async function seedDatabase() {
  if (process.env.NODE_ENV === "production") return;
  if (!isFirebaseConfigured()) return;
  const existingScores = await storage.getScores();
  if (existingScores.length === 0) {
    await storage.createScore({ userId: "seed-1", username: "Knight", score: 1000 });
    await storage.createScore({ userId: "seed-2", username: "Archer", score: 850 });
    await storage.createScore({ userId: "seed-3", username: "Mage", score: 920 });
  }
}

export function registerRoutes(app: Express): void {
  seedDatabase().catch(() => {});

  app.post("/api/auth/session", async (req, res) => {
    const { idToken } = z
      .object({ idToken: z.string().min(1) })
      .parse(req.body);

    if (!isFirebaseConfigured()) {
      return res
        .status(500)
        .json({ message: "Firebase Admin env vars not configured" });
    }

    const expiresIn = 14 * 24 * 60 * 60 * 1000;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    res.cookie("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    return res.status(204).end();
  });

  app.post("/api/auth/logout", async (_req, res) => {
    res.clearCookie("session", { path: "/" });
    return res.status(204).end();
  });

  app.get("/api/auth/me", async (req, res) => {
    const sessionCookie = (req as any).cookies?.session as string | undefined;
    if (!sessionCookie)
      return res.status(401).json({ message: "Not authenticated" });
    if (!isFirebaseConfigured())
      return res.status(500).json({ message: "Firebase not configured" });

    try {
      const decoded = await getAdminAuth().verifySessionCookie(
        sessionCookie,
        true
      );
      const uid = decoded.uid;

      const userDoc = await getAdminDb().collection("users").doc(uid).get();
      const data = userDoc.exists ? userDoc.data() : undefined;

      return res.json({
        uid,
        twitterUsername: data?.twitterUsername ?? null,
        wallet: data?.wallet ?? null,
        highScore:
          typeof (data as any)?.highScore === "number"
            ? (data as any).highScore
            : null,
      });
    } catch {
      return res.status(401).json({ message: "Invalid session" });
    }
  });

  app.post("/api/users/wallet", async (req, res) => {
    const sessionCookie = (req as any).cookies?.session as string | undefined;
    if (!sessionCookie)
      return res.status(401).json({ message: "Not authenticated" });
    if (!isFirebaseConfigured())
      return res.status(500).json({ message: "Firebase not configured" });

    const { wallet, twitterUsername, twitterId } = z
      .object({
        wallet: z.string().min(1),
        twitterUsername: z.string().min(1).optional(),
        twitterId: z.string().min(1).optional(),
      })
      .parse(req.body);

    try {
      const decoded = await getAdminAuth().verifySessionCookie(
        sessionCookie,
        true
      );
      const uid = decoded.uid;

      const userRef = getAdminDb().collection("users").doc(uid);
      await userRef.set(
        {
          ...(twitterUsername ? { twitterUsername } : {}),
          ...(twitterId ? { twitterId } : {}),
          wallet,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      return res.status(204).end();
    } catch {
      return res.status(401).json({ message: "Invalid session" });
    }
  });

  app.get(api.scores.list.path, async (req, res) => {
    const scores = await storage.getScores();
    res.json(scores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      let boundInput = input;
      const sessionCookie = (req as any).cookies?.session as string | undefined;
      if (sessionCookie) {
        try {
          const decoded = await getAdminAuth().verifySessionCookie(
            sessionCookie,
            true
          );
          const uid = decoded.uid;
          const userDoc = await getAdminDb()
            .collection("users")
            .doc(uid)
            .get();
          const twitterUsername = userDoc.exists
            ? (userDoc.data() as any)?.twitterUsername
            : undefined;
          boundInput = {
            ...input,
            userId: uid,
            username:
              twitterUsername || input.username || "anonymous",
          };
        } catch {
          // ignore, use unbound input
        }
      }

      const score = await storage.createScore(boundInput);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });
}
