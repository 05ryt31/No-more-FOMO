import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";

export const getUniversities = baseProcedure
  .query(async () => {
    const universities = await db.university.findMany({
      orderBy: { name: "asc" },
    });
    return universities;
  });

export const getUniversityById = baseProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const university = await db.university.findUnique({
      where: { id: input.id },
    });

    if (!university) {
      throw new Error("University not found");
    }

    return university;
  });

export const getDefaultUniversity = baseProcedure
  .query(async () => {
    // For MVP, return UCLA as the default pilot university
    const university = await db.university.findFirst({
      where: { id: "ucla" },
    });

    if (!university) {
      throw new Error("Default university not found");
    }

    return university;
  });
