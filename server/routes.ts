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
    const existingCardNames = new Set(existingCards.map(c => c.name));
    const builtInCards = getBuiltInAngelCards();
    let cardsAdded = 0;
    for (const c of builtInCards) {
      if (!existingCardNames.has(c.name)) {
        await storage.createAngelCard(c);
        cardsAdded++;
      }
    }

    res.json({ message: `Mudras: added ${added}, removed ${removed}. Angel cards: added ${cardsAdded}`, mudraCount: builtInMudras.length, cardCount: existingCards.length + cardsAdded });
  });

  return httpServer;
}

function getBuiltInAngelCards() {
  return [
    { name: "Grace", message: "Allow grace to flow through you. You are held in ways you cannot see.", meaning: "A reminder that unseen forces support you. Surrender the need to control and let life carry you forward with trust." },
    { name: "Courage", message: "The strength you seek already lives within you. Step forward.", meaning: "You have faced difficulty before and emerged. This card calls you to act from your inner fire, not from fear." },
    { name: "Patience", message: "What is meant for you will not pass you by. Trust the timing.", meaning: "Not everything blooms in the same season. This card asks you to release urgency and honor the natural rhythm of unfolding." },
    { name: "Healing", message: "Your wounds are becoming your wisdom. Let the light in through the cracks.", meaning: "Pain that has been acknowledged transforms into understanding. This card signals a season of mending, body and spirit." },
    { name: "Abundance", message: "Open your hands to receive. The universe gives generously to those who are ready.", meaning: "Abundance is not only material — it is love, time, creativity, and connection. Notice what is already overflowing in your life." },
    { name: "Trust", message: "Even when you cannot see the path, the ground beneath you is solid.", meaning: "Doubt clouds vision but does not change reality. This card encourages you to keep walking, even in the dark." },
    { name: "Joy", message: "Happiness is not something to chase. It is something to allow.", meaning: "Joy arrives when resistance softens. Let go of the belief that you must earn delight — it is your birthright." },
    { name: "Release", message: "What you cling to, clings to you. Let it go and find yourself lighter.", meaning: "Holding on to what no longer serves you drains your energy. This card is permission to set down the weight." },
    { name: "Clarity", message: "The fog is lifting. Soon you will see clearly what has always been true.", meaning: "Confusion is temporary. Be still, and the answers you seek will surface on their own." },
    { name: "Protection", message: "You are surrounded by light. Nothing harmful can reach the center of who you are.", meaning: "This card reassures you that your essence is untouchable. External storms cannot disturb your deepest self." },
    { name: "Forgiveness", message: "Forgiveness is not a gift to others. It is freedom for yourself.", meaning: "Carrying resentment binds you to the past. This card invites you to release, not for them, but for your own peace." },
    { name: "Transformation", message: "You are not falling apart. You are falling into a new form.", meaning: "Change can feel like loss, but it is often rebirth. Trust the process of becoming who you are meant to be." },
    { name: "Stillness", message: "In the quiet space between breaths, all answers rest.", meaning: "The world is loud, but wisdom speaks softly. This card invites you to stop doing and simply be." },
    { name: "Connection", message: "You are never truly alone. Invisible threads bind you to all living things.", meaning: "Loneliness is an illusion of separation. This card reminds you that love is the fabric of existence." },
    { name: "Purpose", message: "You are here for a reason. Even the smallest act carries meaning.", meaning: "Purpose is not one grand mission — it is the love you bring to ordinary moments. You are already fulfilling it." },
    { name: "Gratitude", message: "The door to abundance opens with the key of thankfulness.", meaning: "When you honor what you have, more arrives. This card asks you to pause and count the blessings hiding in plain sight." },
    { name: "Surrender", message: "Stop swimming against the current. Turn around and let the river carry you.", meaning: "Effort has its place, but so does yielding. This card signals it is time to trust a larger plan." },
    { name: "Hope", message: "Even the longest night eventually gives way to dawn.", meaning: "No matter how dark the present feels, light is approaching. Hold on — the sunrise is closer than you think." },
    { name: "Compassion", message: "Be gentle with yourself first. You cannot pour from an empty vessel.", meaning: "Self-compassion is not selfishness — it is the foundation of all kindness. Fill your own cup before serving others." },
    { name: "Wisdom", message: "The answers are not above you. They are within you, waiting quietly.", meaning: "You already know more than you realize. This card encourages you to listen inward before seeking outward." },
    { name: "Faith", message: "Believe in what you cannot yet see. The seed trusts the soil.", meaning: "Faith is action taken before proof arrives. Plant your intentions and trust the invisible process of growth." },
    { name: "Harmony", message: "When you align with your true nature, everything else falls into place.", meaning: "Struggle often comes from living out of alignment. This card invites you to return to what feels authentic and whole." },
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
