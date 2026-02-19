import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMudraSchema, insertJournalSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

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

function getBuiltInAngelCards() {
  return [
    { name: "111", message: "Your thoughts are manifesting rapidly. Focus on what you truly desire.", meaning: "A powerful alignment signal. The universe is mirroring your thoughts back to you — choose them wisely, because seeds planted now grow fast." },
    { name: "222", message: "Trust the process. Everything is unfolding in perfect divine timing.", meaning: "Balance and patience are your allies. Partnerships, cooperation, and faith are being called forward. Stay the course." },
    { name: "333", message: "The ascended masters are near, guiding and supporting you.", meaning: "Your creative energy is amplified. Express yourself fully — you are surrounded by spiritual teachers helping you grow." },
    { name: "444", message: "Angels surround you now. You are protected and deeply loved.", meaning: "A foundation of stability and protection. Your angels are close, reinforcing that you are on the right path. Keep building." },
    { name: "555", message: "Major change is coming. Release the old to welcome the new.", meaning: "Transformation is at your doorstep. Let go of what no longer serves you — something better is arriving to take its place." },
    { name: "666", message: "Realign your thoughts. Return to balance between material and spiritual.", meaning: "Not a number to fear — it is a gentle nudge to refocus. You may be too caught up in worry or material concerns. Come back to center." },
    { name: "777", message: "You are in divine flow. Miracles and blessings are unfolding.", meaning: "Deep spiritual alignment and luck. You have been doing the inner work, and the universe is rewarding your trust. Stay open." },
    { name: "888", message: "Abundance is flowing toward you. Receive it with open arms.", meaning: "Financial and energetic prosperity are on their way. This number signals the completion of a cycle and the harvest of your efforts." },
    { name: "999", message: "A chapter is closing. Honor the ending and prepare for a new beginning.", meaning: "Completion and release. Something in your life is reaching its natural conclusion — let it go gracefully to make room for what comes next." },
    { name: "000", message: "You are one with the infinite. A new cycle begins from the void.", meaning: "The number of infinite potential. You stand at a blank canvas — everything is possible. Connect to source energy and begin again." },
    { name: "1111", message: "A spiritual awakening is occurring. You are being called to a higher purpose.", meaning: "The master number of awakening. Pay attention to your thoughts and intentions right now — the gateway is wide open." },
    { name: "1212", message: "Stay positive and trust that your dreams are being supported from above.", meaning: "A sign of encouragement from the divine. Keep your vibration high and know that your optimism is creating your reality." },
    { name: "1010", message: "You are evolving. Trust the personal growth happening within you.", meaning: "Spiritual development and forward motion. The old version of you is falling away, revealing someone stronger and more aligned." },
    { name: "1234", message: "You are on the right path. Keep moving step by step.", meaning: "A sequential sign of progress. Each step you take is leading somewhere meaningful — don't rush, just keep going." },
    { name: "2222", message: "Have faith. Your prayers have been heard and are being answered.", meaning: "Doubled trust energy. The universe has received your intentions and is working behind the scenes. Patience will be rewarded." },
    { name: "3333", message: "You are fully supported by the universe. Express your truth boldly.", meaning: "Amplified creative and spiritual power. Speak, create, and share without hesitation — your guides are cheering you on." },
    { name: "4444", message: "Your angels are wrapping you in love. You are never alone.", meaning: "Quadrupled protection. During uncertain times, this number appears to remind you that divine support is absolute and unwavering." },
    { name: "5555", message: "Massive shifts are underway. Embrace the unknown with courage.", meaning: "Accelerated change at every level. Hold on loosely and trust that the upheaval is clearing space for something extraordinary." },
    { name: "1144", message: "Build your dreams on a foundation of faith and hard work.", meaning: "A blend of new beginnings and stable foundations. Your angels encourage you to take practical steps toward your spiritual calling." },
    { name: "717", message: "You are on the right spiritual path. Keep going with confidence.", meaning: "A confirmation that your choices align with your soul's purpose. The angels celebrate your courage to follow your inner truth." },
    { name: "911", message: "Your soul mission is calling. Step into your role as a lightworker.", meaning: "A number of spiritual service and leadership. You are being asked to use your gifts to uplift others — the world needs what you carry." },
    { name: "808", message: "What was lost is being restored. Abundance circles back to you.", meaning: "Karmic balance and material recovery. The universe is returning to you what is rightfully yours — be ready to receive." },
  ];
}

function getBuiltInMudras() {
  return [
    {
      name: "Gyan Mudra",
      sanskritName: "Chin Mudra",
      description: "The mudra of knowledge and wisdom. Connects the individual consciousness with the universal consciousness.",
      benefits: ["Improves concentration", "Sharpens memory", "Promotes calmness"],
      image: "/images/mudra-gyan.png",
      category: "spiritual",
      instructions: ["Sit in a comfortable meditative pose.", "Touch the tip of your index finger to the tip of your thumb.", "Keep the other three fingers straight but relaxed.", "Rest your hands on your knees, palms facing upward."]
    },
    {
      name: "Anjali Mudra",
      sanskritName: "Namaste",
      description: "A gesture of offering, greeting, and salutation. It represents the union of the right and left hemispheres of the brain.",
      benefits: ["Reduces stress", "Connects to the heart chakra", "Promotes humility"],
      image: "/images/mudra-anjali.png",
      category: "spiritual",
      instructions: ["Bring your palms together at the heart center.", "Press the palms evenly against each other.", "Bow your head slightly towards your hands.", "Focus on your breath and heart beat."]
    },
    {
      name: "Dhyana Mudra",
      sanskritName: "Samadhi Mudra",
      description: "The mudra of meditation. It forms a bowl shape, signifying that we are open to receive new energy.",
      benefits: ["Deepens meditation", "Balances left and right energy channels", "Promotes tranquility"],
      image: "/images/mudra-dhyana.png",
      category: "calming",
      instructions: ["Sit with a straight spine.", "Place your hands in your lap, palms facing up.", "Rest the right hand on top of the left hand.", "Touch the tips of your thumbs together to form a triangle."]
    },
    {
      name: "Surya Mudra",
      sanskritName: "Agni Mudra",
      description: "The mudra of fire. It increases the fire element in the body and helps improve metabolism and digestion.",
      benefits: ["Boosts metabolism", "Improves digestion", "Generates heat in the body"],
      image: "/images/mudra-surya.png",
      category: "energizing",
      instructions: ["Sit in a comfortable position.", "Fold your ring finger down to touch the base of the thumb.", "Press the thumb gently onto the ring finger's knuckle.", "Keep the other fingers straight."]
    },
    {
      name: "Vayu Mudra",
      sanskritName: "Mudra of Air",
      description: "The mudra of air. It balances the air element in the body and is helpful for relieving gas, bloating, and joint pain.",
      benefits: ["Relieves gas and bloating", "Reduces joint pain", "Calms anxious energy"],
      image: "/images/mudra-vayu.png",
      category: "healing",
      instructions: ["Sit comfortably with a straight spine.", "Fold your index finger to touch the base of the thumb.", "Press the thumb gently over the index finger.", "Keep the other three fingers straight and relaxed."]
    },
    {
      name: "Prana Mudra",
      sanskritName: "Mudra of Life",
      description: "The mudra of life force. It activates the dormant energy in the body and boosts vitality and immunity.",
      benefits: ["Increases vitality", "Boosts immunity", "Reduces fatigue"],
      image: "/images/mudra-prana.png",
      category: "energizing",
      instructions: ["Sit in a meditative pose.", "Touch the tips of your ring and pinky fingers to the tip of the thumb.", "Keep the index and middle fingers straight.", "Rest your hands on your knees."]
    },
    {
      name: "Shuni Mudra",
      sanskritName: "Seal of Patience",
      description: "Associated with Saturn, this mudra promotes patience, discipline, and stability. It helps you stick to your commitments.",
      benefits: ["Improves patience", "Encourages discipline", "Helps turn negative emotions into positive ones"],
      image: "/images/mudra-shuni.png",
      category: "spiritual",
      instructions: ["Sit in a comfortable position.", "Touch the tip of your middle finger to the tip of your thumb.", "Keep the other fingers straight and relaxed.", "Rest your hands on your knees."]
    },
    {
      name: "Varun Mudra",
      sanskritName: "Jal Vardhak Mudra",
      description: "The mudra of water. It balances the water element in the body, hydrating the skin and tissues.",
      benefits: ["Balances water content", "Improves skin health", "Enhances communication"],
      image: "/images/mudra-varun.png",
      category: "healing",
      instructions: ["Touch the tip of your little finger to the tip of your thumb.", "Keep the other three fingers straight.", "Do not press too hard; a light touch is sufficient.", "Practice for 15-45 minutes daily."]
    },
    {
      name: "Apana Mudra",
      sanskritName: "Mudra of Digestion",
      description: "Regulates the Apana Vayu (downward moving energy). It is excellent for detoxification and digestion.",
      benefits: ["Detoxifies the body", "Strengthens the immune system", "Relieves constipation"],
      image: "/images/mudra-apana.png",
      category: "healing",
      instructions: ["Bring the tips of the middle and ring fingers to the tip of the thumb.", "Keep the index and little fingers straight.", "Rest your hands on your lap.", "Focus on the abdominal area."]
    },
    {
      name: "Adi Mudra",
      sanskritName: "Primal Seal",
      description: "A grounding gesture that calms the nervous system and increases lung capacity. It is often used in breathing exercises.",
      benefits: ["Increases lung capacity", "Calms the nervous system", "Promotes grounding"],
      image: "/images/mudra-adi.png",
      category: "calming",
      instructions: ["Tuck your thumb into your palm.", "Curl your other four fingers over the thumb to form a gentle fist.", "Place your hands on your thighs facing downwards.", "Breathe deeply."]
    },
    {
      name: "Hakini Mudra",
      sanskritName: "Mudra of the Mind",
      description: "Named after the Hakini chakra (third eye), this mudra improves memory, concentration, and synchronizes the brain hemispheres.",
      benefits: ["Improves memory", "Enhances concentration", "Clarifies the mind"],
      image: "/images/mudra-hakini.png",
      category: "spiritual",
      instructions: ["Bring the tips of all fingers of both hands together.", "Form a tent-like shape.", "Hold the mudra in front of your solar plexus or rest it in your lap.", "Gaze upward towards the third eye point."]
    },
    {
      name: "Abhaya Mudra",
      sanskritName: "Mudra of Fearlessness",
      description: "A gesture of reassurance, blessing, and protection. It dispels fear and accords divine protection and bliss.",
      benefits: ["Dispels fear", "Promotes inner strength", "Cultivates peace"],
      image: "/images/mudra-abhaya.png",
      category: "spiritual",
      instructions: ["Raise your right hand to shoulder height.", "Bend the arm at the elbow.", "Face the palm outward with fingers upright and joined.", "The left hand can rest by your side or in another mudra."]
    },
  ];
}
