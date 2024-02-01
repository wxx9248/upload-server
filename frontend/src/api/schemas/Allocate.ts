import { z } from "zod";

export const PostRequestSchema = z.object({
    // eslint-disable-next-line no-magic-numbers
    name: z.string().min(1),
    size: z.number().int().nonnegative()
});

export const PostResponseSchema = z.discriminatedUnion("status", [
    z.object({ status: z.literal("success"), id: z.string().uuid() }),
    z.object({ status: z.literal("fail"), reason: z.string() })
]);
