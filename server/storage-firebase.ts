import { getAdminDb } from "./firebase.js";
import admin from "firebase-admin";
import {
  Score,
  InsertScore,
  User,
  InsertUser,
  UpdateUser,
  RewardLog,
  InsertRewardLog,
} from "../shared/schema.js";

export interface IStorage {
  getScores(): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  getUser(userId: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: string, updates: UpdateUser): Promise<User>;
  getUserByTwitterId(twitterId: string): Promise<User | null>;
  getRewardLogs(): Promise<RewardLog[]>;
  createRewardLog(insert: InsertRewardLog): Promise<RewardLog>;
}

export class FirebaseStorage implements IStorage {
  async getScores(): Promise<Score[]> {
    const db = getAdminDb();
    const scoresSnapshot = await db
      .collection("scores")
      .orderBy("score", "desc")
      .limit(10)
      .get();

    return scoresSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        username: data.username,
        score: data.score,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const db = getAdminDb();
    const scoreRef = db.collection("scores").doc();
    const safeUserId = insertScore.userId ?? "anonymous";
    const safeUsername = insertScore.username ?? "anonymous";
    const score: Score = {
      id: scoreRef.id,
      userId: safeUserId,
      username: safeUsername,
      score: insertScore.score,
      createdAt: new Date(),
    };

    await scoreRef.set({
      userId: score.userId,
      username: score.username,
      score: score.score,
      createdAt: admin.firestore.Timestamp.fromDate(score.createdAt),
    });

    return score;
  }

  async getUser(userId: string): Promise<User | null> {
    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;

    const data = userDoc.data()!;
    return {
      id: userDoc.id,
      twitterUsername: data.twitterUsername,
      twitterId: data.twitterId,
      wallet: data.wallet,
      highScore:
        typeof data.highScore === "number" ? data.highScore : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = getAdminDb();
    const userRef = db.collection("users").doc();
    const user: User = {
      id: userRef.id,
      ...insertUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const setData: Record<string, unknown> = {
      twitterUsername: user.twitterUsername,
      twitterId: user.twitterId,
      createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(user.updatedAt),
    };
    if (user.wallet != null) setData.wallet = user.wallet;
    if (user.highScore != null) setData.highScore = user.highScore;
    await userRef.set(setData);

    return user;
  }

  async updateUser(userId: string, updates: UpdateUser): Promise<User> {
    const db = getAdminDb();
    const userRef = db.collection("users").doc(userId);
    const updateData: Record<string, unknown> = {
      updatedAt: admin.firestore.Timestamp.fromDate(new Date()),
    };

    if (updates.twitterUsername !== undefined) {
      updateData.twitterUsername = updates.twitterUsername;
    }
    if (updates.wallet !== undefined) {
      updateData.wallet = updates.wallet;
    }
    if (updates.highScore !== undefined) {
      updateData.highScore = updates.highScore;
    }

    await userRef.update(updateData);

    const updatedDoc = await userRef.get();
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      twitterUsername: data.twitterUsername,
      twitterId: data.twitterId,
      wallet: data.wallet,
      highScore:
        typeof data.highScore === "number" ? data.highScore : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const db = getAdminDb();
    const usersSnapshot = await db.collection("users").get();

    return usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        twitterUsername: data.twitterUsername,
        twitterId: data.twitterId,
        wallet: data.wallet,
        highScore:
          typeof data.highScore === "number" ? data.highScore : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  }

  async getUserByTwitterId(twitterId: string): Promise<User | null> {
    const db = getAdminDb();
    const usersSnapshot = await db
      .collection("users")
      .where("twitterId", "==", twitterId)
      .limit(1)
      .get();

    if (usersSnapshot.empty) return null;

    const doc = usersSnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      twitterUsername: data.twitterUsername,
      twitterId: data.twitterId,
      wallet: data.wallet,
      highScore:
        typeof data.highScore === "number" ? data.highScore : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  async getRewardLogs(): Promise<RewardLog[]> {
    const db = getAdminDb();
    const snapshot = await db
      .collection("reward_logs")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        txLink: d.txLink,
        player: d.player,
        amount: d.amount,
        createdAt: d.createdAt?.toDate() || new Date(),
      };
    });
  }

  async createRewardLog(insert: InsertRewardLog): Promise<RewardLog> {
    const db = getAdminDb();
    const ref = db.collection("reward_logs").doc();
    const log: RewardLog = {
      id: ref.id,
      txLink: insert.txLink,
      player: insert.player,
      amount: insert.amount,
      createdAt: new Date(),
    };
    await ref.set({
      txLink: log.txLink,
      player: log.player,
      amount: log.amount,
      createdAt: admin.firestore.Timestamp.fromDate(log.createdAt),
    });
    return log;
  }
}

export const storage = new FirebaseStorage();
