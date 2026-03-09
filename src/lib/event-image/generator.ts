// ---------------------------------------------------------------------------
// Event image — Main generator (orchestrator)
// ---------------------------------------------------------------------------

import type { BggGame } from "../bgg";
import type { LudoyaEvent } from "../ludoya";
import { resolveEventGames } from "../game-matching";
import { composeEventImage } from "./composer";

/**
 * Generate a 1080×1080 PNG event image for sharing.
 *
 * Pipeline:
 * 1. Resolve planned plays → BGG games (matching + search)
 * 2. Compose image (placeholder + date/time + game frames)
 *
 * @returns PNG buffer
 */
export async function generateEventImage(
  event: LudoyaEvent,
  bggGames: BggGame[]
): Promise<Buffer> {
  const resolvedGames = await resolveEventGames(event.plannedPlays, bggGames);
  return composeEventImage(event, resolvedGames);
}
