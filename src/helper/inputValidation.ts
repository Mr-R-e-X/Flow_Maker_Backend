import { z } from "zod";

export const inputValidation = <T extends z.ZodTypeAny>(
  data: any,
  schema: T
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: string[] } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map((err) => err.message);
    return { success: false, error: errors };
  }
};
