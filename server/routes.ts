import type { Express } from "express";
import { storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import {
  getAdminAuth,
  getAdminDb,
  isFirebaseConfigured,
} from "./firebase.js";
import { getContractData } from "./contract.js";

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
    try {
      const { idToken } = z
        .object({ idToken: z.string().min(1) })
        .parse(req.body);

      if (!isFirebaseConfigured()) {
        console.error("[POST /api/auth/session] Firebase not configured");
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
    } catch (err) {
      console.error("[POST /api/auth/session] Error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: err.errors 
        });
      }
      return res.status(500).json({ 
        message: "Failed to establish session", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  app.post("/api/auth/logout", async (_req, res) => {
    res.clearCookie("session", { path: "/" });
    return res.status(204).end();
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const sessionCookie = (req as any).cookies?.session as string | undefined;
      if (!sessionCookie) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!isFirebaseConfigured()) {
        console.error("[GET /api/auth/me] Firebase not configured");
        return res.status(500).json({ message: "Firebase not configured" });
      }

      try {
        const decoded = await getAdminAuth().verifySessionCookie(
          sessionCookie,
          true
        );
        const uid = decoded.uid;

        const [userDoc, authUser] = await Promise.all([
          getAdminDb().collection("users").doc(uid).get(),
          getAdminAuth().getUser(uid),
        ]);
        const data = userDoc.exists ? userDoc.data() : undefined;

        return res.json({
          uid,
          twitterUsername: data?.twitterUsername ?? null,
          wallet: data?.wallet ?? null,
          highScore:
            typeof (data as any)?.highScore === "number"
              ? (data as any).highScore
              : null,
          photoURL: authUser?.photoURL ?? null,
        });
      } catch (authError) {
        console.error("[GET /api/auth/me] Auth error:", authError);
        return res.status(401).json({ message: "Invalid session" });
      }
    } catch (err) {
      console.error("[GET /api/auth/me] Unexpected error:", err);
      return res.status(500).json({ 
        message: "Internal server error", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  app.post("/api/users/wallet", async (req, res) => {
    try {
      const sessionCookie = (req as any).cookies?.session as string | undefined;
      if (!sessionCookie) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!isFirebaseConfigured()) {
        console.error("[POST /api/users/wallet] Firebase not configured");
        return res.status(500).json({ message: "Firebase not configured" });
      }

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
      } catch (authError) {
        console.error("[POST /api/users/wallet] Auth error:", authError);
        return res.status(401).json({ message: "Invalid session" });
      }
    } catch (err) {
      console.error("[POST /api/users/wallet] Error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: err.errors 
        });
      }
      return res.status(500).json({ 
        message: "Internal server error", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  app.get(api.scores.list.path, async (req, res) => {
    try {
      const scores = await storage.getScores();
      res.json(scores);
    } catch (err) {
      console.error("[GET /api/scores] Error:", err);
      res.status(500).json({ 
        message: "Failed to fetch scores", 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      let boundInput = input;
      let authenticatedUid: string | undefined;
      const sessionCookie = (req as any).cookies?.session as string | undefined;
      if (sessionCookie) {
        try {
          const decoded = await getAdminAuth().verifySessionCookie(
            sessionCookie,
            true
          );
          authenticatedUid = decoded.uid;
          const userDoc = await getAdminDb()
            .collection("users")
            .doc(authenticatedUid)
            .get();
          const twitterUsername = userDoc.exists
            ? (userDoc.data() as any)?.twitterUsername
            : undefined;
          boundInput = {
            ...input,
            userId: authenticatedUid,
            username:
              twitterUsername || input.username || "anonymous",
          };
        } catch {
          // ignore, use unbound input
        }
      }

      const score = await storage.createScore(boundInput);
      
      // Si hay sesión y el score es mayor al highScore del usuario, actualizarlo
      if (authenticatedUid && boundInput.userId === authenticatedUid) {
        try {
          const user = await storage.getUser(authenticatedUid);
          if (user && (user.highScore == null || score.score > (user.highScore ?? 0))) {
            await storage.updateUser(authenticatedUid, { highScore: score.score });
          }
        } catch {
          // ignore
        }
      }
      
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

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("[GET /api/users] Error:", err);
      res.status(500).json({ message: "Failed to fetch users", error: String(err) });
    }
  });

  app.get("/api/treasury", async (req, res) => {
    try {
      const token = typeof (req.query as any)?.token === "string" ? (req.query as any).token : undefined;
      const debug = String((req.query as any)?.debug || "") === "1";

      const tokenAddress =
        token && /^0x[a-fA-F0-9]{40}$/.test(token) ? token : undefined;

      const data = await getContractData({ tokenAddress, includeDebug: debug });
      res.json({
        fundsBalance: data.fundsBalance,
        liquidityBalance: data.liquidityBalance,
        ...(debug ? { debug: data.debug ?? null } : {}),
      });
    } catch (err) {
      console.error("[GET /api/treasury] Error:", err);
      res.status(500).json({
        fundsBalance: "0",
        liquidityBalance: "0",
      });
    }
  });

  app.get("/api/contract-address", async (_req, res) => {
    try {
      const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
      const taxProcessorAddress = process.env.TAX_PROCESSOR_ADDRESS;
      // Prefer TOKEN_CONTRACT_ADDRESS, fallback to TAX_PROCESSOR_ADDRESS
      const address = tokenAddress || taxProcessorAddress || null;
      res.json({ address });
    } catch (err) {
      console.error("[GET /api/contract-address] Error:", err);
      res.status(500).json({ address: null });
    }
  });

  app.get("/api/rewards-log", async (_req, res) => {
    try {
      const logs = await storage.getRewardLogs();
      res.json(logs);
    } catch (err) {
      console.error("[GET /api/rewards-log] Error:", err);
      res.status(500).json({ message: "Failed to fetch rewards log" });
    }
  });

  const insertRewardLogBody = z.object({
    txLink: z.string().url(),
    player: z.string().min(1),
    amount: z.number().positive(),
  });

  app.post("/api/rewards-log", async (req, res) => {
    try {
      const sessionCookie = (req as any).cookies?.session as string | undefined;
      if (!sessionCookie) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!isFirebaseConfigured()) {
        return res.status(500).json({ message: "Firebase not configured" });
      }
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
      const body = insertRewardLogBody.parse(req.body);
      const log = await storage.createRewardLog(body);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: err.errors });
      }
      if ((err as any)?.code === "auth/session-cookie-expired" || (err as any)?.code === "auth/session-cookie-revoked") {
        return res.status(401).json({ message: "Session expired" });
      }
      console.error("[POST /api/rewards-log] Error:", err);
      res.status(500).json({ message: "Failed to add reward log" });
    }
  });
}
