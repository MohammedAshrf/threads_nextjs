import * as z from "zod";

export const UserValidation = z.object({
  id: z.string(),
  profile_photo: z.string().url().min(1),
  name: z.string().min(3).max(30),
  username: z.string().min(3).max(30),
  bio: z.string().min(3).max(1000),
});
