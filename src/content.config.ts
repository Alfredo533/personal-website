import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    category: z.enum(["wealth", "health", "philosophy"]),
    tags: z.array(z.string()),
    approval: z.enum(["placeholder", "author-approved"]),
    approvalDigest: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  }),
});
export const collections = { writing };
