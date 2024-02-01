import { z } from "zod";

export const PutRequestSchema = z.object({
    id: z.string().uuid(),
    chunkCount: z.union([z.string().regex(/^(?:\d+|end)$/u), z.literal("end")])
});

export const PutResponseSchema = z.discriminatedUnion("status", [
    z.object({
        status: z.literal("success"),
        nextChunkCount: z.union([z.number().int().positive(), z.literal("end")])
    }),
    z.object({ status: z.literal("fail"), reason: z.string() })
]);
