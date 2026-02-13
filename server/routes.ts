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

  // --- Seed built-in mudras ---
  app.post("/api/seed", async (_req, res) => {
    const existing = await storage.getMudras();
    const existingNames = new Set(existing.map(m => m.name));
    const builtInMudras = getBuiltInMudras();
    let added = 0;
    for (const m of builtInMudras) {
      if (!existingNames.has(m.name)) {
        await storage.createMudra({ ...m, image: m.image ?? null });
        added++;
      }
    }
    res.json({ message: added > 0 ? `Added ${added} new mudras` : "All mudras present", count: existing.length + added });
  });

  return httpServer;
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
    {
      name: "Budhi Mudra",
      sanskritName: "Seal of Mental Clarity",
      description: "A gesture that opens the channel of communication and intuition. The thumb meets the ring finger, creating a circuit that sharpens inner dialogue and helps you trust the quiet voice within.",
      benefits: ["Enhances intuition", "Improves communication", "Clears mental fog"],
      image: "/images/mudra-budhi.png",
      category: "spiritual",
      instructions: ["Hold one hand upright with the palm facing forward.", "Touch the tip of the thumb to the tip of the ring finger.", "Keep the index and middle fingers extended gently upward.", "Hold for 5-15 minutes during seated meditation."]
    },
    {
      name: "Kshepana Mudra",
      sanskritName: "Gesture of Pouring Out",
      description: "A powerful release gesture where both hands interlock and point upward like a vessel tipping over. It helps drain away stagnant energy and negative emotions, making room for renewal.",
      benefits: ["Releases negative energy", "Promotes emotional cleansing", "Encourages letting go"],
      image: "/images/mudra-kshepana.png",
      category: "calming",
      instructions: ["Interlace the fingers of both hands.", "Extend both index fingers upward, pressing them together.", "Cross the thumbs, one over the other.", "Hold at heart level and breathe deeply for 2-3 minutes."]
    },
    {
      name: "Karana Mudra",
      sanskritName: "Gesture of Warding Off",
      description: "An ancient protective seal used to banish obstacles and dispel heaviness from the mind. The tucked finger creates a shield while the extended fingers channel clarity forward.",
      benefits: ["Removes obstacles", "Protects against negativity", "Strengthens resolve"],
      image: "/images/mudra-karana.png",
      category: "energizing",
      instructions: ["Extend the hand with the palm facing outward.", "Fold the pinky finger inward to touch the thumb.", "Keep the index, middle, and ring fingers extended.", "Hold the gesture at shoulder height during practice."]
    },
    {
      name: "Atmanjali Mudra",
      sanskritName: "Seal of the Inner Self",
      description: "A deeper variation of the prayer gesture, where the fingers press firmly together to create a single unified column of energy. It draws awareness inward, connecting you to the still center within.",
      benefits: ["Deepens self-awareness", "Centers scattered thoughts", "Cultivates inner stillness"],
      image: "/images/mudra-atmanjali.png",
      category: "calming",
      instructions: ["Press the palms and all fingers firmly together.", "Align the fingers so they point straight upward.", "Bring the joined hands to the center of the chest.", "Close your eyes and focus on the warmth between your palms."]
    },
    {
      name: "Steeple Mudra",
      sanskritName: "Shikhara Anjali",
      description: "The tall prayer gesture forms a tower reaching upward, symbolizing aspiration and connection between earth and sky. The elongated form draws energy upward along the spine, lifting both posture and spirit.",
      benefits: ["Elevates mood", "Improves posture awareness", "Strengthens willpower"],
      image: "/images/mudra-steeple.png",
      category: "spiritual",
      instructions: ["Press your palms together with fingers fully extended.", "Raise the joined hands so fingertips point directly upward.", "Keep a slight space between the heels of the palms.", "Breathe slowly, imagining energy rising from the base of the spine."]
    },
    {
      name: "Jnana Mudra",
      sanskritName: "Seal of Wisdom",
      description: "The hand rests open like a bowl receiving water, with the thumb and forefinger meeting in a soft circle. This ancient gesture of the teacher signifies that true wisdom arrives not through grasping, but through quiet receptivity.",
      benefits: ["Cultivates receptivity", "Calms the nervous system", "Invites insight"],
      image: "/images/mudra-jnana.png",
      category: "calming",
      instructions: ["Let one hand rest naturally at your side, palm facing up.", "Gently touch the tip of the thumb to the tip of the index finger.", "Allow the remaining fingers to curl softly inward.", "Hold with relaxed shoulders and slow, easy breathing."]
    },
    {
      name: "Prithvi Mudra",
      sanskritName: "Seal of the Earth",
      description: "A grounding gesture that connects the body's fire and earth elements. The ring and pinky fingers fold inward to meet the thumb, anchoring restless energy and building steady, patient strength from the ground up.",
      benefits: ["Grounds scattered energy", "Builds physical endurance", "Promotes stability"],
      image: "/images/mudra-prithvi.png",
      category: "energizing",
      instructions: ["Hold the hand upright with the palm facing forward.", "Curl the ring and pinky fingers inward to touch the thumb tip.", "Keep the index and middle fingers extended.", "Practice for 10-30 minutes, ideally in the morning."]
    },
    {
      name: "Akash Mudra",
      sanskritName: "Seal of Space",
      description: "A gesture that expands the space element within, creating openness in the chest, throat, and mind. The relaxed hand and touching fingers invite a feeling of boundlessness, like gazing into a clear sky.",
      benefits: ["Opens the heart center", "Relieves heaviness in the chest", "Expands awareness"],
      image: "/images/mudra-akash.png",
      category: "calming",
      instructions: ["Let the hand rest palm upward, relaxed and open.", "Touch the tip of the middle finger to the tip of the thumb.", "Allow the other fingers to remain softly extended.", "Breathe into the space behind the sternum."]
    },
    {
      name: "Kalesvara Mudra",
      sanskritName: "Seal of the Lord of Time",
      description: "Both hands join with thumbs crossed and fingers interlaced, forming a gateway that slows the rush of thought. Named after the deity who governs time, this mudra helps you step outside the current of urgency and into calm presence.",
      benefits: ["Quiets racing thoughts", "Cultivates patience", "Sharpens focus"],
      image: "/images/mudra-kalesvara.png",
      category: "spiritual",
      instructions: ["Interlace all fingers of both hands.", "Cross the thumbs, one resting over the other.", "Point the joined fingers upward.", "Gaze softly at the hands and count ten slow breaths."]
    },
    {
      name: "Uttarabodhi Mudra",
      sanskritName: "Seal of Supreme Enlightenment",
      description: "The open hand with all fingers spread wide is a gesture of total openness and fearless receiving. It represents the moment of awakening — nothing hidden, nothing held back, fully present to what is.",
      benefits: ["Dissolves fear", "Promotes fearless openness", "Energizes the whole body"],
      image: "/images/mudra-uttarabodhi.png",
      category: "energizing",
      instructions: ["Raise one hand with the palm facing outward.", "Spread all five fingers wide apart.", "Feel the stretch between each finger.", "Hold for several breaths, imagining light radiating from the palm."]
    },
    {
      name: "Vitarka Mudra",
      sanskritName: "Gesture of Discussion",
      description: "The teaching gesture of the Buddha — thumb and index finger form a circle of endless truth while the remaining fingers curl inward, holding knowledge close. It is the mudra of sharing wisdom without force, of offering understanding as a gift.",
      benefits: ["Enhances eloquence", "Promotes thoughtful speech", "Deepens understanding"],
      image: "/images/mudra-vitarka.png",
      category: "spiritual",
      instructions: ["Hold one hand at chest level.", "Touch the tip of the index finger to the tip of the thumb, forming a circle.", "Let the other three fingers curl naturally inward.", "Keep the wrist relaxed and the shoulder dropped."]
    }
  ];
}
