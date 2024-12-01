import { z } from "zod";

export const signUpManualSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be at most 50 characters" }),
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const signUpProviderSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be at most 50 characters" }),
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  provider: z.string(),
  providerId: z.string(),
});

export const signInManualSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const signInProviderSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  provider: z.string(),
  providerId: z.string(),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string({ message: "otp is required" })
    .min(6, { message: "otp must be at least 6 characters" }),
});
