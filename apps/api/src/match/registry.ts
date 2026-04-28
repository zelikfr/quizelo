import type { FastifyBaseLogger } from "fastify";
import type { MatchRoom } from "./room";

/**
 * In-memory map of running matches.
 *
 * Single-process scope for now. When we go multi-instance we'll move room
 * pinning to Redis (matchId → server) and proxy WS connections.
 */
class MatchRegistry {
  private rooms = new Map<string, MatchRoom>();

  set(matchId: string, room: MatchRoom): void {
    this.rooms.set(matchId, room);
  }

  get(matchId: string): MatchRoom | undefined {
    return this.rooms.get(matchId);
  }

  delete(matchId: string, log?: FastifyBaseLogger): void {
    const room = this.rooms.get(matchId);
    if (!room) return;
    room.dispose();
    this.rooms.delete(matchId);
    log?.info({ matchId }, "match disposed");
  }

  list(): MatchRoom[] {
    return Array.from(this.rooms.values());
  }
}

export const registry = new MatchRegistry();
