import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { env } from "~/server/env";

async function verifyUserAuth(token: string) {
  try {
    const verified = jwt.verify(token, env.JWT_SECRET);
    const parsed = z.object({ userId: z.string() }).parse(verified);

    const user = await db.user.findUnique({
      where: { id: parsed.userId },
    });

    if (!user || !user.isActive) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found or account deactivated",
      });
    }

    return user;
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED", 
      message: "Invalid or expired token",
    });
  }
}

export const registerForEvent = baseProcedure
  .input(
    z.object({
      token: z.string(),
      eventId: z.string(),
      customFields: z.record(z.any()).optional(), // Flexible object to store any custom form data
    })
  )
  .mutation(async ({ input }) => {
    const user = await verifyUserAuth(input.token);

    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Event not found",
      });
    }

    // Check if user is already registered
    const existingRegistration = await db.userEvent.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: input.eventId,
        },
      },
    });

    if (existingRegistration) {
      // Update existing registration to 'going' status and update custom fields
      const updatedRegistration = await db.userEvent.update({
        where: { id: existingRegistration.id },
        data: { 
          status: "going",
          customFields: input.customFields || null,
        },
      });
      return { success: true, registration: updatedRegistration };
    } else {
      // Create new registration
      const registration = await db.userEvent.create({
        data: {
          userId: user.id,
          eventId: input.eventId,
          status: "going",
          customFields: input.customFields || null,
        },
      });
      return { success: true, registration };
    }
  });

export const cancelEventRegistration = baseProcedure
  .input(
    z.object({
      token: z.string(),
      eventId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const user = await verifyUserAuth(input.token);

    const existingRegistration = await db.userEvent.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: input.eventId,
        },
      },
    });

    if (!existingRegistration) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Registration not found",
      });
    }

    // Update registration status to cancelled
    const updatedRegistration = await db.userEvent.update({
      where: { id: existingRegistration.id },
      data: { status: "cancelled" },
    });

    return { success: true, registration: updatedRegistration };
  });

export const getUserEventRegistrations = baseProcedure
  .input(
    z.object({
      token: z.string(),
      status: z.enum(["going", "cancelled", "interested"]).optional(),
    })
  )
  .query(async ({ input }) => {
    const user = await verifyUserAuth(input.token);

    const whereClause: any = {
      userId: user.id,
    };

    if (input.status) {
      whereClause.status = input.status;
    }

    const registrations = await db.userEvent.findMany({
      where: whereClause,
      include: {
        event: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return registrations;
  });

export const getUserRegistrationStatus = baseProcedure
  .input(
    z.object({
      token: z.string(),
      eventIds: z.array(z.string()),
    })
  )
  .query(async ({ input }) => {
    const user = await verifyUserAuth(input.token);

    const registrations = await db.userEvent.findMany({
      where: {
        userId: user.id,
        eventId: { in: input.eventIds },
      },
    });

    // Return a map of eventId -> status
    const statusMap: Record<string, string> = {};
    registrations.forEach((reg) => {
      statusMap[reg.eventId] = reg.status;
    });

    return statusMap;
  });
