import * as z from "zod";

export const ThreadValidation = z.object({
  accountId: z.string(),
  thread: z.string().min(1, {
    message: "Minimum 3 characters",
  }),
});

export const CommentValidation = z.object({
  thread: z.string().min(1, {
    message: "Minimum 3 characters",
  }),
});
