import { eq, desc, lte, isNull, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  mudras,
  journalEntries,
  angelCards,
  angelCardDraws,
  type Mudra,
  type InsertMudra,
  type JournalEntry,
  type InsertJournal,
  type AngelCard,
  type AngelCardDraw,
  type InsertAngelCard,
} from "@shared/schema";

export interface IStorage {
  getMudras(): Promise<Mudra[]>;
  getMudra(id: string): Promise<Mudra | undefined>;
  createMudra(mudra: InsertMudra): Promise<Mudra>;
  deleteMudra(id: string): Promise<void>;

  getJournalEntries(): Promise<JournalEntry[]>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournal): Promise<JournalEntry>;
  deleteJournalEntry(id: string): Promise<void>;
  setBurnTimer(id: string, burnAt: Date): Promise<JournalEntry | undefined>;
  burnEntry(id: string): Promise<void>;
  burnExpiredEntries(): Promise<number>;

  getAngelCards(): Promise<AngelCard[]>;
  createAngelCard(card: InsertAngelCard): Promise<AngelCard>;
  getLatestDraw(): Promise<(AngelCardDraw & { card: AngelCard }) | null>;
  createDraw(angelCardId: string): Promise<AngelCardDraw>;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DatabaseStorage implements IStorage {
  async getMudras(): Promise<Mudra[]> {
    return db.select().from(mudras).orderBy(mudras.createdAt);
  }

  async getMudra(id: string): Promise<Mudra | undefined> {
    const [mudra] = await db.select().from(mudras).where(eq(mudras.id, id));
    return mudra;
  }

  async createMudra(mudra: InsertMudra): Promise<Mudra> {
    const [created] = await db.insert(mudras).values(mudra).returning();
    return created;
  }

  async deleteMudra(id: string): Promise<void> {
    await db.delete(mudras).where(eq(mudras.id, id));
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    return db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async createJournalEntry(entry: InsertJournal): Promise<JournalEntry> {
    const [created] = await db.insert(journalEntries).values(entry).returning();
    return created;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  async setBurnTimer(id: string, burnAt: Date): Promise<JournalEntry | undefined> {
    const [updated] = await db
      .update(journalEntries)
      .set({ burnAt })
      .where(eq(journalEntries.id, id))
      .returning();
    return updated;
  }

  async burnEntry(id: string): Promise<void> {
    await db
      .update(journalEntries)
      .set({ burnedAt: new Date() })
      .where(eq(journalEntries.id, id));
  }

  async burnExpiredEntries(): Promise<number> {
    const now = new Date();
    const expired = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          lte(journalEntries.burnAt, now),
          isNull(journalEntries.burnedAt)
        )
      );
    
    for (const entry of expired) {
      await db
        .update(journalEntries)
        .set({ burnedAt: now })
        .where(eq(journalEntries.id, entry.id));
    }
    
    return expired.length;
  }

  async getAngelCards(): Promise<AngelCard[]> {
    return db.select().from(angelCards);
  }

  async createAngelCard(card: InsertAngelCard): Promise<AngelCard> {
    const [created] = await db.insert(angelCards).values(card).returning();
    return created;
  }

  async getLatestDraw(): Promise<(AngelCardDraw & { card: AngelCard }) | null> {
    const [draw] = await db
      .select()
      .from(angelCardDraws)
      .orderBy(desc(angelCardDraws.drawnAt))
      .limit(1);
    if (!draw) return null;
    const [card] = await db.select().from(angelCards).where(eq(angelCards.id, draw.angelCardId));
    if (!card) return null;
    return { ...draw, card };
  }

  async createDraw(angelCardId: string): Promise<AngelCardDraw> {
    const [created] = await db.insert(angelCardDraws).values({ angelCardId }).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
