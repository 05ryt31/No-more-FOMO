import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { env } from "~/server/env";

export const verifyToken = baseProcedure
  .input(z.object({
    token: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      // Verify and parse the JWT token
      const verified = jwt.verify(input.token, env.JWT_SECRET);
      const parsed = z.object({ userId: z.string() }).parse(verified);

      // Get user from database
      const user = await db.user.findUnique({
        where: { id: parsed.userId },
      });

      if (!user || !user.isActive) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found or account deactivated",
        });
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          universityId: user.universityId,
          interests: user.interests,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  });
