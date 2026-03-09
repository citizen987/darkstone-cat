// ---------------------------------------------------------------------------
// Game Matching Engine — Resolve Ludoya planned plays to BGG games
// ---------------------------------------------------------------------------

import type { BggGame, BggSearchResult, BggThingBasic } from "./bgg";
import { searchBggGames, fetchBggThings } from "./bgg";
import type { LudoyaPlannedPlay } from "./ludoya";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type GameType = "boardgame" | "rpg" | "unknown";
export type FrameColor = "green" | "orange" | "red" | "rpg";

export interface ResolvedGame {
  name: string; // Display name (from Ludoya)
  bggId: string;
  imageUrl: string; // High-res BGG image
  weight: number;
  type: GameType;
  frame: FrameColor;
}

// ---------------------------------------------------------------------------
// Manual overrides: Ludoya game name → BGG game ID
// ---------------------------------------------------------------------------
// Add entries here when fuzzy matching fails for specific games.
// Key = exact game name as it appears in Ludoya (case-sensitive).

const GAME_NAME_OVERRIDES: Record<string, string> = {
  // "Ludoya Name": "BGG ID",
};

// ---------------------------------------------------------------------------
// Manual RPG list — fallback when BGG type/categories are unavailable
// ---------------------------------------------------------------------------

const RPG_GAME_NAMES = new Set([
  "dungeons & dragons",
  "d&d",
  "d&d roleplaying game dice",
  "pathfinder",
  "call of cthulhu",
  "la crida de cthulhu",
  "la llamada de cthulhu",
  "vampire the masquerade",
  "vampire: la mascarada",
  "aquelarre",
  "forbidden lands",
  "mothership",
  "mork borg",
  "mörk borg",
  "blades in the dark",
  "fate",
  "savage worlds",
  "shadowrun",
  "warhammer fantasy roleplay",
  "pendragon",
  "runequest",
  "traveller",
  "stars without number",
  "cyberpunk red",
  "delta green",
  "alien rpg",
  "vaesen",
  "symbaroum",
  "the one ring",
  "el senyor dels anells",
  "dungeon world",
  "kids on bikes",
  "tales from the loop",
  "the witcher",
  "dragon age",
  "world of darkness",
]);

// ---------------------------------------------------------------------------
// BGG item types that indicate RPG or Accessory
// ---------------------------------------------------------------------------
// The BGG thing endpoint `<item type="...">` is the most reliable indicator.

const RPG_BGG_TYPES = new Set([
  "rpgitem",
  "rpgissue",
]);

const ACCESSORY_BGG_TYPES = new Set([
  "boardgameaccessory",
]);

// ---------------------------------------------------------------------------
// BGG categories for classification fallback
// ---------------------------------------------------------------------------
// Used when we have categories but no thingType (e.g. club collection games).

const ACCESSORY_BGG_CATEGORIES = new Set([
  "Accessory",
  "Accessory (dice, maps, screens, cards)",
]);

// ---------------------------------------------------------------------------
// Name normalization
// ---------------------------------------------------------------------------

function normalizeName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      // Remove diacritics (accents)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Remove common articles
      .replace(/\b(el|la|els|les|los|las|the|a|an|l'|d')\b/g, "")
      // Remove special characters except spaces and ampersands
      .replace(/[^a-z0-9\s&]/g, "")
      // Collapse multiple spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}

// ---------------------------------------------------------------------------
// Levenshtein distance
// ---------------------------------------------------------------------------

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

// ---------------------------------------------------------------------------
// Minimum similarity threshold for fuzzy matching
// ---------------------------------------------------------------------------

const FUZZY_THRESHOLD = 0.75;

// ---------------------------------------------------------------------------
// Core matching functions (against club collection)
// ---------------------------------------------------------------------------

function findById(bggGames: BggGame[], id: string): BggGame | null {
  return bggGames.find((g) => g.id === id) ?? null;
}

function findExactMatch(
  bggGames: BggGame[],
  normalizedName: string
): BggGame | null {
  return (
    bggGames.find((g) => {
      if (normalizeName(g.name) === normalizedName) return true;
      if (g.originalName && normalizeName(g.originalName) === normalizedName)
        return true;
      return false;
    }) ?? null
  );
}

function findFuzzyMatch(
  bggGames: BggGame[],
  normalizedName: string
): BggGame | null {
  let bestGame: BggGame | null = null;
  let bestScore = 0;

  for (const game of bggGames) {
    const nameScore = similarity(normalizeName(game.name), normalizedName);
    let score = nameScore;

    if (game.originalName) {
      const origScore = similarity(
        normalizeName(game.originalName),
        normalizedName
      );
      score = Math.max(score, origScore);
    }

    if (score > bestScore) {
      bestScore = score;
      bestGame = game;
    }
  }

  return bestScore >= FUZZY_THRESHOLD ? bestGame : null;
}

// ---------------------------------------------------------------------------
// BGG search: pick the best candidate from search results
// ---------------------------------------------------------------------------

function pickBestSearchResult(
  results: BggSearchResult[],
  normalizedName: string
): BggSearchResult | null {
  let best: BggSearchResult | null = null;
  let bestScore = 0;

  for (const r of results) {
    const score = similarity(normalizeName(r.name), normalizedName);
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }

  return bestScore >= FUZZY_THRESHOLD ? best : null;
}

// ---------------------------------------------------------------------------
// Game type detection
// ---------------------------------------------------------------------------

function isRpgByName(ludoyaName: string): boolean {
  const normalized = normalizeName(ludoyaName);
  const rpgNames = Array.from(RPG_GAME_NAMES);
  for (let i = 0; i < rpgNames.length; i++) {
    if (normalized.includes(normalizeName(rpgNames[i]))) return true;
  }
  return false;
}

function hasAccessoryCategory(categories: string[]): boolean {
  for (let i = 0; i < categories.length; i++) {
    if (ACCESSORY_BGG_CATEGORIES.has(categories[i])) return true;
  }
  return false;
}

/**
 * Determine game type.
 * Priority:
 *   1. Manual RPG name list (forced, skips all other checks)
 *   2. Accessory detection (BGG type or category → unknown)
 *   3. RPG detection (BGG item type rpgitem/rpgissue → rpg)
 *   4. Default → boardgame
 */
export function getGameType(
  categories: string[],
  ludoyaName: string,
  thingType?: string
): GameType {
  // 1. Manual name lists — forced classification, no further checks needed
  if (isRpgByName(ludoyaName)) return "rpg";

  // 2. Accessory — BGG type or category
  if (thingType && ACCESSORY_BGG_TYPES.has(thingType)) return "unknown";
  if (hasAccessoryCategory(categories)) return "unknown";

  // 3. RPG — BGG item type
  if (thingType && RPG_BGG_TYPES.has(thingType)) return "rpg";

  // 4. Default: boardgame
  return "boardgame";
}

// ---------------------------------------------------------------------------
// Difficulty → frame color
// ---------------------------------------------------------------------------

export function getDifficultyFrame(weight: number, type: GameType): FrameColor {
  if (type === "rpg" || type === "unknown") return "rpg";
  if (weight <= 0) return "orange"; // No weight data → default medium
  if (weight < 2.5) return "green";
  if (weight <= 3.5) return "orange";
  return "red";
}

// ---------------------------------------------------------------------------
// Build ResolvedGame helpers
// ---------------------------------------------------------------------------

function buildFromBggGame(
  ludoyaName: string,
  game: BggGame
): ResolvedGame {
  // Club collection games have subtype "boardgame"/"boardgameexpansion"
  const type = getGameType(game.categories, ludoyaName, game.subtype);
  return {
    name: ludoyaName,
    bggId: game.id,
    imageUrl: game.image,
    weight: game.weight,
    type,
    frame: getDifficultyFrame(game.weight, type),
  };
}

function buildFromThingData(
  ludoyaName: string,
  thing: BggThingBasic
): ResolvedGame {
  // External games from BGG search — use thingType for classification
  const type = getGameType(thing.categories, ludoyaName, thing.thingType);
  return {
    name: ludoyaName,
    bggId: thing.id,
    imageUrl: thing.image,
    weight: thing.weight,
    type,
    frame: getDifficultyFrame(thing.weight, type),
  };
}

// ---------------------------------------------------------------------------
// Resolution pipeline (steps 1–3: synchronous, against club collection)
// ---------------------------------------------------------------------------

function resolveFromCollection(
  ludoyaName: string,
  bggGames: BggGame[]
): ResolvedGame | null {
  const normalizedLudoya = normalizeName(ludoyaName);

  // Step 1: Check manual overrides
  const overrideId = GAME_NAME_OVERRIDES[ludoyaName];
  if (overrideId) {
    const game = findById(bggGames, overrideId);
    if (game) return buildFromBggGame(ludoyaName, game);
  }

  // Step 2: Exact normalized match
  const exactMatch = findExactMatch(bggGames, normalizedLudoya);
  if (exactMatch) return buildFromBggGame(ludoyaName, exactMatch);

  // Step 3: Fuzzy matching
  const fuzzyMatch = findFuzzyMatch(bggGames, normalizedLudoya);
  if (fuzzyMatch) return buildFromBggGame(ludoyaName, fuzzyMatch);

  return null;
}

// ---------------------------------------------------------------------------
// Prioritization: balance boardgames and RPGs, then take first N
// ---------------------------------------------------------------------------

const MAX_GAMES = 8;

function prioritizeGames(games: ResolvedGame[]): ResolvedGame[] {
  if (games.length <= MAX_GAMES) return games;

  const boardgames = games.filter((g) => g.type === "boardgame");
  const rpgs = games.filter((g) => g.type === "rpg");

  if (boardgames.length === 0 || rpgs.length === 0) {
    return games.slice(0, MAX_GAMES);
  }

  const rpgRatio = rpgs.length / games.length;
  let rpgSlots = Math.max(1, Math.round(MAX_GAMES * rpgRatio));
  let bgSlots = MAX_GAMES - rpgSlots;

  if (rpgSlots > rpgs.length) {
    rpgSlots = rpgs.length;
    bgSlots = MAX_GAMES - rpgSlots;
  }
  if (bgSlots > boardgames.length) {
    bgSlots = boardgames.length;
    rpgSlots = MAX_GAMES - bgSlots;
  }

  const selected = [
    ...boardgames.slice(0, bgSlots),
    ...rpgs.slice(0, rpgSlots),
  ];

  return selected.sort(
    (a, b) =>
      games.findIndex((g) => g.bggId === a.bggId) -
      games.findIndex((g) => g.bggId === b.bggId)
  );
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Resolve event planned plays to enriched game data for image generation.
 *
 * Pipeline per game:
 *   1. Manual override (GAME_NAME_OVERRIDES)
 *   2. Exact match against club BGG collection
 *   3. Fuzzy match against club BGG collection
 *   4. BGG search API → thing endpoint (for external games not in collection)
 *   5. No match → game is excluded from the image
 *
 * After resolution: dedup, balance boardgame/RPG ratio, cap at 8.
 */
export async function resolveEventGames(
  plannedPlays: LudoyaPlannedPlay[],
  bggGames: BggGame[]
): Promise<ResolvedGame[]> {
  const resolved: ResolvedGame[] = [];
  const unresolved: { index: number; ludoyaName: string }[] = [];

  // Steps 1–3: try to resolve from the club collection (fast, sync)
  for (let i = 0; i < plannedPlays.length; i++) {
    const name = plannedPlays[i].gameName;
    const match = resolveFromCollection(name, bggGames);
    if (match) {
      resolved.push(match);
    } else {
      unresolved.push({ index: i, ludoyaName: name });
    }
  }

  // Step 4: search BGG API for unresolved games (external games)
  if (unresolved.length > 0) {
    // Search BGG in parallel for all unresolved games
    const searchResults = await Promise.all(
      unresolved.map((u) => searchBggGames(u.ludoyaName, 5))
    );

    // Pick best candidate from search results for each game
    const thingIdsToFetch: string[] = [];
    const candidateMap = new Map<string, string>(); // bggId → ludoyaName

    for (let i = 0; i < unresolved.length; i++) {
      const normalizedName = normalizeName(unresolved[i].ludoyaName);
      const best = pickBestSearchResult(searchResults[i], normalizedName);
      if (best) {
        thingIdsToFetch.push(best.id);
        candidateMap.set(best.id, unresolved[i].ludoyaName);
      }
    }

    // Batch fetch thing data for all candidates
    if (thingIdsToFetch.length > 0) {
      const thingMap = await fetchBggThings(thingIdsToFetch);

      const candidateEntries = Array.from(candidateMap.entries());
      for (let i = 0; i < candidateEntries.length; i++) {
        const [bggId, ludoyaName] = candidateEntries[i];
        const thing = thingMap.get(bggId);
        if (thing && thing.image) {
          resolved.push(buildFromThingData(ludoyaName, thing));
        }
      }
    }
  }

  // Maintain original Ludoya order
  const nameOrder = plannedPlays.map((pp) => pp.gameName);
  resolved.sort(
    (a, b) => nameOrder.indexOf(a.name) - nameOrder.indexOf(b.name)
  );

  // Deduplicate by BGG ID
  const seen = new Set<string>();
  const deduped = resolved.filter((g) => {
    if (seen.has(g.bggId)) return false;
    seen.add(g.bggId);
    return true;
  });

  return prioritizeGames(deduped);
}
