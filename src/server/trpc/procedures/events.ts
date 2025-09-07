import { z } from "zod";
import jwt from "jsonwebtoken";
import { env } from "~/server/env";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getEvents = baseProcedure
  .input(
    z.object({
      universityId: z.string(),
      interests: z.array(z.string()).optional(),
      timeFilter: z.enum(["all", "happening-soon", "make-it-in-time"]).optional().default("all"),
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
      token: z.string().optional(), // Optional authentication token
    })
  )
  .query(async ({ input }) => {
    const { universityId, interests, timeFilter, limit, offset } = input;

    let whereClause: any = {
      universityId,
    };

    // Apply time filters
    const now = new Date();
    if (timeFilter === "happening-soon") {
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      whereClause.start = {
        gte: now,
        lte: next24Hours,
      };
    } else if (timeFilter === "make-it-in-time") {
      // For "make it in time", we'll fetch all future events and let the client filter by ETA
      whereClause.start = {
        gte: now,
      };
    } else {
      // "all" - show future events
      whereClause.start = {
        gte: now,
      };
    }

    // Apply interest filtering if provided
    if (interests && interests.length > 0) {
      whereClause.categories = {
        hasSome: interests,
      };
    }

    const events = await db.event.findMany({
      where: whereClause,
      orderBy: [
        { start: "asc" },
        { popularity: "desc" },
      ],
      take: limit,
      skip: offset,
    });

    // If token is provided, get user's registration status for these events
    let userRegistrations: Record<string, string> = {};
    if (input.token) {
      try {
        const verified = jwt.verify(input.token, env.JWT_SECRET);
        const parsed = z.object({ userId: z.string() }).parse(verified);
        
        const user = await db.user.findUnique({
          where: { id: parsed.userId },
        });

        if (user && user.isActive) {
          const registrations = await db.userEvent.findMany({
            where: {
              userId: user.id,
              eventId: { in: events.map(e => e.id) },
            },
          });

          registrations.forEach((reg) => {
            userRegistrations[reg.eventId] = reg.status;
          });
        }
      } catch (error) {
        // Token invalid or expired - just continue without user registration data
        console.log("Invalid token provided to getEvents, continuing without user data");
      }
    }

    // Add registration status to each event
    const eventsWithRegistrationStatus = events.map(event => ({
      ...event,
      userRegistrationStatus: userRegistrations[event.id] || null,
    }));

    return eventsWithRegistrationStatus;
  });

export const getEventById = baseProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const event = await db.event.findUnique({
      where: { id: input.id },
    });

    if (!event) {
      throw new Error("Event not found");
    }

    return event;
  });

export const getEventCategories = baseProcedure
  .input(z.object({ universityId: z.string() }))
  .query(async ({ input }) => {
    const events = await db.event.findMany({
      where: { universityId: input.universityId },
      select: { categories: true },
    });

    // Extract unique categories
    const allCategories = events.flatMap(event => event.categories);
    const uniqueCategories = Array.from(new Set(allCategories)).sort();

    return uniqueCategories;
  });
