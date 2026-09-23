import z from 'zod';

export const LikeResponseSchema = z.object({
  id: z.uuidv4(),
  likes: z.number().int(),
  liked: z.boolean(),
});
