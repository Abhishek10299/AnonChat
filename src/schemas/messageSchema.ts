import { z } from "zod";

export const messageSchema = z.object({
  continue: z
    .string()
    .max(300, { message: "Content must be no longer than 300 characters" }),
});
