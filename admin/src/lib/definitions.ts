import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  userType: z
    .number()
    .refine(val => Object.values(roleMap).includes(val), {
      message: "Invalid user type",
    }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Role code mapper - matches database role values
export const roleMap: Record<string, number> = {
  youth: 1,
  organization: 2,
  admin: 3,
};

