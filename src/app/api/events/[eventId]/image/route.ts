import { NextResponse } from "next/server";
import { fetchUpcomingEvents } from "@/lib/ludoya";
import { fetchBggCollection } from "@/lib/bgg";
import { generateEventImage } from "@/lib/event-image/generator";

// Allow up to 30s for image generation (BGG image fetches can be slow)
export const maxDuration = 30;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store",
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  // Validate eventId
  if (!eventId || typeof eventId !== "string" || eventId.trim().length === 0) {
    return NextResponse.json(
      { error: "invalid_event_id" },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  try {
    // Fetch events and BGG collection in parallel
    const [eventsResult, bggResult] = await Promise.all([
      fetchUpcomingEvents(),
      fetchBggCollection(),
    ]);

    // Find the event by ID across both regular and special events
    const allEvents = [
      ...eventsResult.regularEvents,
      ...eventsResult.specialEvents,
    ];
    const event = allEvents.find((e) => e.id === eventId);

    if (!event) {
      return NextResponse.json(
        { error: "event_not_found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    // Generate the image
    const pngBuffer = await generateEventImage(event, bggResult.games);

    return new Response(pngBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(pngBuffer.length),
        ...NO_CACHE_HEADERS,
      },
    });
  } catch (err) {
    console.error("[EventImage] Generation failed:", err);
    return NextResponse.json(
      { error: "generation_failed" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
