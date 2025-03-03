import { z } from "zod";

export const AddProductSchema = z.object({
  brand: z
    .string()
    .min(3, { message: "Brand name is required" })
    .max(100, { message: "Brand name exceed 100 characters." }),

  title: z
    .string()
    .min(6, { message: "Title must be at least 6 characters long. " })
    .max(100, { message: "Title cannot exceed 100 characters." }),

  code: z
    .string()
    .min(6, { message: "Code must be at least 2 characters long. " })
    .max(100, { message: "Code cannot exceed 100 characters." }),

  categories: z
    .string()
    .min(6, { message: "Title must be at least 6 characters long. " })
    .max(100, { message: "Title cannot exceed 100 characters." }),

  stock: z.number().min(1, { message: "Add product stock value." }),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long. " })
    .max(500, { message: "Description cannot exceed 500 characters." })
    .optional(),
});
