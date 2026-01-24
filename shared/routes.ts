import { z } from "zod";
import { insertScoreSchema, scoreSchema } from "./schema";

export type { InsertScore } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  scores: {
    list: {
      method: "GET" as const,
      path: "/api/scores",
      responses: {
        200: z.array(scoreSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/scores",
      input: insertScoreSchema,
      responses: {
        201: scoreSchema,
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
