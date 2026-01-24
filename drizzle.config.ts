import { defineConfig } from "drizzle-kit";

// Firebase/Firestore is used for users & scores. DATABASE_URL optional (e.g. for migrations).
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/castle",
  },
});
