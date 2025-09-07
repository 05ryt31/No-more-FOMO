import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { db } from "~/server/db";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const eventExtractionSchema = z.object({
  title: z.string().describe("The event title"),
  description: z.string().optional().describe("Event description"),
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  startTime: z.string().describe("Start time in HH:MM format (24-hour)"),
  endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
  endTime: z.string().optional().describe("End time in HH:MM format (24-hour)"),
  location: z.string().optional().describe("Event location"),
  categories: z.array(z.string()).describe("Event categories/tags"),
  imageUrl: z.string().optional().describe("Event image URL if found"),
});

export const extractEventFromText = baseProcedure
  .input(
    z.object({
      text: z.string().describe("URL or text content to extract event information from"),
      universityId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: eventExtractionSchema,
        prompt: `Extract event information from the following text or URL content. If this is a URL, imagine what a typical event page might contain. Focus on extracting:
        - Event title
        - Start date and time
        - End date and time (if available)
        - Location
        - Description
        - Relevant categories (choose from: Academic, Career, Sports, Social, Free Food, Greek Life, Arts, Music, Technology, Wellness, Workshop, Networking, Information, etc.)
        - Image URL (if present)

        Text/URL: ${input.text}

        If you cannot extract clear information, make reasonable assumptions for a typical campus event.`,
      });

      return {
        success: true,
        data: result.object,
      };
    } catch (error) {
      console.error("Event extraction error:", error);
      return {
        success: false,
        error: "Failed to extract event information",
      };
    }
  });

export const createEvent = baseProcedure
  .input(
    z.object({
      universityId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      startDate: z.string(), // YYYY-MM-DD
      startTime: z.string(), // HH:MM
      endDate: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
      categories: z.array(z.string()),
      imageUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const {
      universityId,
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      location,
      categories,
      imageUrl,
    } = input;

    // Parse start datetime
    const start = new Date(`${startDate}T${startTime}:00`);
    
    // Parse end datetime if provided
    let end: Date | undefined;
    if (endDate && endTime) {
      end = new Date(`${endDate}T${endTime}:00`);
    } else if (endTime) {
      end = new Date(`${startDate}T${endTime}:00`);
    }

    // Generate dedupe key
    const dedupeKey = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${startDate}-${location?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'no-location'}`;

    const event = await db.event.create({
      data: {
        universityId,
        title,
        description,
        start,
        end,
        location,
        categories,
        image: imageUrl,
        sourceIds: [], // Manual submission, no sources
        dedupeKey,
        popularity: 0,
      },
    });

    return event;
  });
