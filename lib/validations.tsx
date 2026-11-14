import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long. " })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),

  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    // .regex(/[A-Z]/, {
    //   message: "Password must contain at least one uppercase letter.",
    // })
    // .regex(/[a-z]/, {
    //   message: "Password must contain at least one lowercase letter.",
    // })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  // .regex(/[^a-zA-Z0-9]/, {
  //   message: "Password must contain at least one special character.",
  // }),
});

export const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." }),
  email: z.string().email({ message: "Please provide a valid email address." }),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  address: z.string().optional(),
  contactNumber: z
    .number()
    .min(10, { message: "Invalid contact number. Must be a 10-digit number" })
    .max(10, { message: "Invalid contact number. Must be a 10-digit number" }),
});

export const AccountSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
});

export const SignInWithOAuthSchema = z.object({
  provider: z.enum(["google", "github"]),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
  user: z.object({
    name: z.string().min(1, { message: "Name is required." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long." }),
    email: z
      .string()
      .email({ message: "Please provide a valid email address." }),
    image: z.string().url("Invalid image URL").optional(),
  }),
});

export const ProductSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  brand: z
    .string()
    .min(5, { message: "Title is required." })
    .max(100, { message: "Title cannot exceed 100 characters." }),
  description: z.string().min(1, { message: "Body is required." }),
  categories: z
    .array(
      z
        .string()
        .min(1, { message: "Category is required." })
        .max(30, { message: "Category cannot exceed 30 characters." })
    )
    .min(1, { message: "At least one category is required." })
    .max(3, { message: "Cannot add more than 3 categories." }),

  stock: z.number().min(0, { message: "Please enter stock." }),
  code: z
    .string()
    .min(1, { message: "Code is required." })
    .max(100, { message: "Code cannot exceed 100 characters." }),
  remark: z
    .string()
    .min(2, { message: "Remark is required." })
    .max(100, { message: "Remark cannot exceed 100 characters." }),
});

export const EditProductSchema = ProductSchema.extend({
  productID: z.string().min(1, { message: "product ID is required." }),
  // remark: z
  //   .string()
  //   .min(2, { message: "Remark is required." })
  //   .max(100, { message: "Remark cannot exceed 100 characters." }),
});

export const GetProductSchema = z.object({
  productID: z.string().min(1, { message: "product ID is required." }),
});

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(50),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});

export const ProductHistoryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
  from: z.string().datetime().optional(), // ISO string
  to: z.string().datetime().optional(), // ISO string
});

export const AdjustStockSchema = z
  .object({
    productID: z.string().min(1, { message: "Product is required." }),
    locationID: z.string().min(1, { message: "City is required." }),
    type: z.enum(["in", "out", "correction"]),
    change: z
      .number()
      .int({ message: "Quantity must be a whole number." })
      .refine((n) => n !== 0, { message: "Quantity cannot be zero." }),
    reason: z.string().max(50).optional(),
    note: z.string().max(200).optional(),
  })
  .refine((v) => v.type !== "in" || v.change > 0, {
    message: "Stock in must add stock.",
    path: ["change"],
  })
  .refine((v) => v.type !== "out" || v.change < 0, {
    message: "Stock out must remove stock.",
    path: ["change"],
  });

export const TransferStockSchema = z
  .object({
    productID: z.string().min(1, { message: "Product is required." }),
    fromLocationID: z.string().min(1, { message: "From city is required." }),
    toLocationID: z.string().min(1, { message: "To city is required." }),
    quantity: z
      .number()
      .int({ message: "Quantity must be a whole number." })
      .positive({ message: "Quantity must be more than zero." }),
    note: z.string().max(200).optional(),
  })
  .refine((v) => v.fromLocationID !== v.toLocationID, {
    message: "Pick two different cities.",
    path: ["toLocationID"],
  });

export const StockOverviewSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  query: z.string().max(100).optional(),
  filter: z.enum(["", "low", "out"]).optional(),
  city: z
    .string()
    .regex(/^[a-f0-9]{24}$/, { message: "Unknown city." })
    .optional()
    .or(z.literal("")),
});

const cityName = z
  .string()
  .trim()
  .min(2, { message: "City name is too short." })
  .max(40, { message: "City name cannot exceed 40 characters." })
  .regex(/^[\p{L}][\p{L} .'-]*$/u, {
    message: "Use letters, spaces, dots or hyphens only.",
  });

export const CreateCitySchema = z.object({
  name: cityName,
  state: z.string().trim().max(40).optional(),
});

export const UpdateCitySchema = CreateCitySchema.extend({
  locationID: z.string().regex(/^[a-f0-9]{24}$/, { message: "Unknown city." }),
});

export const SetCityActiveSchema = z.object({
  locationID: z.string().regex(/^[a-f0-9]{24}$/, { message: "Unknown city." }),
  active: z.boolean(),
});
