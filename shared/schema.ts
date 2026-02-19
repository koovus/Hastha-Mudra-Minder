import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mudras = pgTable("mudras", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sanskritName: text("sanskrit_name").default(""),
  description: text("description").notNull(),
  benefits: text("benefits").array().notNull(),
  instructions: text("instructions").array().notNull(),
  image: text("image"),
  category: text("category").notNull(),
  isBuiltIn: boolean("is_built_in").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  audioUrl: text("audio_url"),
  duration: text("duration").notNull(),
  mood: text("mood"),
  burnAt: timestamp("burn_at"),
  burnedAt: timestamp("burned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const angelCards = pgTable("angel_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  message: text("message").notNull(),
  meaning: text("meaning").notNull(),
});

export const angelCardDraws = pgTable("angel_card_draws", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  angelCardId: varchar("angel_card_id").notNull(),
  drawnAt: timestamp("drawn_at").defaultNow().notNull(),
});

export const insertMudraSchema = createInsertSchema(mudras).omit({
  id: true,
  createdAt: true,
  isBuiltIn: true,
});

export const insertJournalSchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  burnedAt: true,
});

export const insertAngelCardSchema = createInsertSchema(angelCards).omit({
  id: true,
});

export const insertAngelCardDrawSchema = createInsertSchema(angelCardDraws).omit({
  id: true,
  drawnAt: true,
});

export type InsertMudra = z.infer<typeof insertMudraSchema>;
export type Mudra = typeof mudras.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type AngelCard = typeof angelCards.$inferSelect;
export type AngelCardDraw = typeof angelCardDraws.$inferSelect;
export type InsertAngelCard = z.infer<typeof insertAngelCardSchema>;
export type InsertAngelCardDraw = z.infer<typeof insertAngelCardDrawSchema>;
