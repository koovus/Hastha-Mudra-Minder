import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMudraSchema, insertJournalSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { getBuiltInMudras, getBuiltInAngelCards } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Mudras ---
  app.get("/api/mudras", async (_req, res) => {
    const mudras = await storage.getMudras();
    res.json(mudras);
  });

  app.get("/api/mudras/random", async (_req, res) => {
    const mudras = await storage.getMudras();
    if (mudras.length === 0) return res.status(404).json({ message: "No mudras found" });
    const random = mudras[Math.floor(Math.random() * mudras.length)];
    res.json(random);
  });

  app.get("/api/mudras/:id", async (req, res) => {
    const mudra = await storage.getMudra(req.params.id);
    if (!mudra) return res.status(404).json({ message: "Mudra not found" });
    res.json(mudra);
  });

  app.post("/api/mudras", async (req, res) => {
    const result = insertMudraSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: fromError(result.error).toString() });
    }
    const mudra = await storage.createMudra(result.data);
    res.status(201).json(mudra);
  });

  app.delete("/api/mudras/:id", async (req, res) => {
    await storage.deleteMudra(req.params.id);
    res.status(204).send();
  });

  // --- Journal Entries ---
  app.get("/api/journal", async (_req, res) => {
    await storage.burnExpiredEntries();
    const entries = await storage.getJournalEntries();
    res.json(entries);
  });

  app.post("/api/journal", async (req, res) => {
    const result = insertJournalSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: fromError(result.error).toString() });
    }
    const entry = await storage.createJournalEntry(result.data);
    res.status(201).json(entry);
  });

  app.delete("/api/journal/:id", async (req, res) => {
    await storage.deleteJournalEntry(req.params.id);
    res.status(204).send();
  });

  app.post("/api/journal/:id/burn", async (req, res) => {
    const entry = await storage.getJournalEntry(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    await storage.burnEntry(req.params.id);
    res.json({ message: "Entry burned and released" });
  });

  app.post("/api/journal/:id/burn-timer", async (req, res) => {
    const { burnAt } = req.body;
    if (!burnAt) return res.status(400).json({ message: "burnAt is required" });
    const entry = await storage.setBurnTimer(req.params.id, new Date(burnAt));
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.json(entry);
  });

  // --- Angel Cards ---
  app.get("/api/angel-cards/current", async (_req, res) => {
    const draw = await storage.getLatestDraw();
    if (!draw) return res.json(null);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (new Date(draw.drawnAt) < sevenDaysAgo) return res.json(null);
    res.json(draw);
  });

  app.post("/api/angel-cards/draw", async (_req, res) => {
    const cards = await storage.getAngelCards();
    if (cards.length === 0) return res.status(404).json({ message: "No angel cards available" });
    const random = cards[Math.floor(Math.random() * cards.length)];
    const draw = await storage.createDraw(random.id);
    const [card] = cards.filter(c => c.id === random.id);
    res.json({ ...draw, card });
  });

  // --- Seed built-in mudras ---
  app.post("/api/seed", async (_req, res) => {
    const existing = await storage.getMudras();
    const builtInMudras = getBuiltInMudras();
    const builtInNames = new Set(builtInMudras.map(m => m.name));
    const existingNames = new Set(existing.map(m => m.name));

    let removed = 0;
    for (const m of existing) {
      if (!builtInNames.has(m.name)) {
        await storage.deleteMudra(m.id);
        removed++;
      }
    }

    let added = 0;
    for (const m of builtInMudras) {
      if (!existingNames.has(m.name)) {
        await storage.createMudra({ ...m, image: m.image ?? null });
        added++;
      }
    }
    const existingCards = await storage.getAngelCards();
    const builtInCards = getBuiltInAngelCards();
    const builtInCardNames = new Set(builtInCards.map(c => c.name));
    const existingCardNames = new Set(existingCards.map(c => c.name));

    let cardsRemoved = 0;
    for (const c of existingCards) {
      if (!builtInCardNames.has(c.name)) {
        await storage.deleteAngelCard(c.id);
        cardsRemoved++;
      }
    }

    let cardsAdded = 0;
    for (const c of builtInCards) {
      if (!existingCardNames.has(c.name)) {
        await storage.createAngelCard(c);
        cardsAdded++;
      }
    }

    res.json({ message: `Mudras: +${added}/-${removed}. Cards: +${cardsAdded}/-${cardsRemoved}`, mudraCount: builtInMudras.length, cardCount: builtInCards.length });
  });

  return httpServer;
}
