import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { env } from "~/server/env";

export const signup = baseProcedure
  .input(z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    universityId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const { email, password, universityId } = input;

    // Validate that the email is a university email (basic check for .edu domain)
    if (!email.endsWith('.edu')) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Please use your university email address (.edu domain)",
      });
    }

    // Check if university exists
    const university = await db.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "University not found",
      });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "An account with this email already exists",
      });
    }

    // Hash the password
    const passwordHash = await bcryptjs.hash(password, 12);

    // Create the user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        universityId,
        interests: [], // Start with empty interests
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      env.JWT_SECRET,
      { expiresIn: "1y" }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        universityId: user.universityId,
        interests: user.interests,
      },
    };
  });
