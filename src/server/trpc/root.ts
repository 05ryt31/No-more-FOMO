import {
  createCallerFactory,
  createTRPCRouter,
} from "~/server/trpc/main";
import { getEvents, getEventById, getEventCategories } from "~/server/trpc/procedures/events";
import { getUniversities, getUniversityById, getDefaultUniversity } from "~/server/trpc/procedures/universities";
import { extractEventFromText, createEvent } from "~/server/trpc/procedures/organizer";
import { signup } from "~/server/trpc/procedures/signup";
import { login } from "~/server/trpc/procedures/login";
import { verifyToken } from "~/server/trpc/procedures/verify-token";
import { registerForEvent, cancelEventRegistration, getUserEventRegistrations, getUserRegistrationStatus } from "~/server/trpc/procedures/user-events";

export const appRouter = createTRPCRouter({
  // Event procedures
  getEvents,
  getEventById,
  getEventCategories,
  
  // University procedures
  getUniversities,
  getUniversityById,
  getDefaultUniversity,
  
  // Organizer procedures
  extractEventFromText,
  createEvent,
  
  // Authentication procedures
  signup,
  login,
  verifyToken,
  
  // User event registration procedures
  registerForEvent,
  cancelEventRegistration,
  getUserEventRegistrations,
  getUserRegistrationStatus,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
