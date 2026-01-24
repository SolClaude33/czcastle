import { z } from "zod";

const zDate = z.coerce.date();

// User schema for Firebase
export const userSchema = z.object({
  id: z.string(),
  twitterUsername: z.string().min(1),
  twitterId: z.string(),
  wallet: z.string().optional(),
  highScore: z.number().optional(),
  createdAt: zDate,
  updatedAt: zDate,
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = userSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Score schema (Firestore)
export const scoreSchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  score: z.number(),
  createdAt: zDate,
});

export const insertScoreSchema = z.object({
  score: z.number(),
  username: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type Score = z.infer<typeof scoreSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
