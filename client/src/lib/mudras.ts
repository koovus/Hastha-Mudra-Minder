export interface Mudra {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  image: string;
  category: "calming" | "energizing" | "healing" | "spiritual";
  instructions: string[];
}

export const mudras: Mudra[] = [
  {
    id: "1",
    name: "Gyan Mudra",
    sanskritName: "Chin Mudra",
    description: "The mudra of knowledge and wisdom. Connects the individual consciousness with the universal consciousness.",
    benefits: ["Improves concentration", "Sharpens memory", "Promotes calmness"],
    image: "/images/mudra-gyan.png",
    category: "spiritual",
    instructions: [
      "Sit in a comfortable meditative pose.",
      "Touch the tip of your index finger to the tip of your thumb.",
      "Keep the other three fingers straight but relaxed.",
      "Rest your hands on your knees, palms facing upward."
    ]
  },
  {
    id: "2",
    name: "Anjali Mudra",
    sanskritName: "Namaste",
    description: "A gesture of offering, greeting, and salutation. It represents the union of the right and left hemispheres of the brain.",
    benefits: ["Reduces stress", "Connects to the heart chakra", "Promotes humility"],
    image: "/images/mudra-anjali.png",
    category: "spiritual",
    instructions: [
      "Bring your palms together at the heart center.",
      "Press the palms evenly against each other.",
      "Bow your head slightly towards your hands.",
      "Focus on your breath and heart beat."
    ]
  },
  {
    id: "3",
    name: "Dhyana Mudra",
    sanskritName: "Samadhi Mudra",
    description: "The mudra of meditation. It forms a bowl shape, signifying that we are open to receive new energy.",
    benefits: ["Deepens meditation", "Balances left and right energy channels", "Promotes tranquility"],
    image: "/images/mudra-dhyana.png",
    category: "calming",
    instructions: [
      "Sit with a straight spine.",
      "Place your hands in your lap, palms facing up.",
      "Rest the right hand on top of the left hand.",
      "Touch the tips of your thumbs together to form a triangle."
    ]
  },
  {
    id: "4",
    name: "Surya Mudra",
    sanskritName: "Agni Mudra",
    description: "The mudra of fire. It increases the fire element in the body and helps improve metabolism and digestion.",
    benefits: ["Boosts metabolism", "Improves digestion", "Generates heat in the body"],
    image: "/images/mudra-surya.png",
    category: "energizing",
    instructions: [
      "Sit in a comfortable position.",
      "Fold your ring finger down to touch the base of the thumb.",
      "Press the thumb gently onto the ring finger's knuckle.",
      "Keep the other fingers straight."
    ]
  },
  {
    id: "5",
    name: "Vayu Mudra",
    sanskritName: "Mudra of Air",
    description: "The mudra of air. It balances the air element in the body and is helpful for relieving gas, bloating, and joint pain.",
    benefits: ["Relieves gas and bloating", "Reduces joint pain", "Calms anxious energy"],
    image: "/images/mudra-vayu.png",
    category: "healing",
    instructions: [
      "Sit comfortably with a straight spine.",
      "Fold your index finger to touch the base of the thumb.",
      "Press the thumb gently over the index finger.",
      "Keep the other three fingers straight and relaxed."
    ]
  },
  {
    id: "6",
    name: "Prana Mudra",
    sanskritName: "Mudra of Life",
    description: "The mudra of life force. It activates the dormant energy in the body and boosts vitality and immunity.",
    benefits: ["Increases vitality", "Boosts immunity", "Reduces fatigue"],
    image: "/images/mudra-prana.png",
    category: "energizing",
    instructions: [
      "Sit in a meditative pose.",
      "Touch the tips of your ring and pinky fingers to the tip of the thumb.",
      "Keep the index and middle fingers straight.",
      "Rest your hands on your knees."
    ]
  },
  {
    id: "7",
    name: "Shuni Mudra",
    sanskritName: "Seal of Patience",
    description: "Associated with Saturn, this mudra promotes patience, discipline, and stability. It helps you stick to your commitments.",
    benefits: ["Improves patience", "Encourages discipline", "Helps turn negative emotions into positive ones"],
    image: "/images/mudra-shuni.png",
    category: "spiritual",
    instructions: [
      "Sit in a comfortable position.",
      "Touch the tip of your middle finger to the tip of your thumb.",
      "Keep the other fingers straight and relaxed.",
      "Rest your hands on your knees."
    ]
  },
  {
    id: "8",
    name: "Varun Mudra",
    sanskritName: "Jal Vardhak Mudra",
    description: "The mudra of water. It balances the water element in the body, hydrating the skin and tissues.",
    benefits: ["Balances water content", "Improves skin health", "Enhances communication"],
    image: "/images/mudra-varun.png",
    category: "healing",
    instructions: [
      "Touch the tip of your little finger to the tip of your thumb.",
      "Keep the other three fingers straight.",
      "Do not press too hard; a light touch is sufficient.",
      "Practice for 15-45 minutes daily."
    ]
  },
  {
    id: "9",
    name: "Apana Mudra",
    sanskritName: "Mudra of Digestion",
    description: "Regulates the Apana Vayu (downward moving energy). It is excellent for detoxification and digestion.",
    benefits: ["Detoxifies the body", "Strengthens the immune system", "Relieves constipation"],
    image: "/images/mudra-apana.png",
    category: "healing",
    instructions: [
      "Bring the tips of the middle and ring fingers to the tip of the thumb.",
      "Keep the index and little fingers straight.",
      "Rest your hands on your lap.",
      "Focus on the abdominal area."
    ]
  },
  {
    id: "10",
    name: "Adi Mudra",
    sanskritName: "Primal Seal",
    description: "A grounding gesture that calms the nervous system and increases lung capacity. It is often used in breathing exercises.",
    benefits: ["Increases lung capacity", "Calms the nervous system", "Promotes grounding"],
    image: "/images/mudra-adi.png",
    category: "calming",
    instructions: [
      "Tuck your thumb into your palm.",
      "Curl your other four fingers over the thumb to form a gentle fist.",
      "Place your hands on your thighs facing downwards.",
      "Breathe deeply."
    ]
  },
  {
    id: "11",
    name: "Hakini Mudra",
    sanskritName: "Mudra of the Mind",
    description: "Named after the Hakini chakra (third eye), this mudra improves memory, concentration, and synchronizes the brain hemispheres.",
    benefits: ["Improves memory", "Enhances concentration", "Clarifies the mind"],
    image: "/images/mudra-hakini.png",
    category: "spiritual",
    instructions: [
      "Bring the tips of all fingers of both hands together.",
      "Form a tent-like shape.",
      "Hold the mudra in front of your solar plexus or rest it in your lap.",
      "Gaze upward towards the third eye point."
    ]
  },
  {
    id: "12",
    name: "Abhaya Mudra",
    sanskritName: "Mudra of Fearlessness",
    description: "A gesture of reassurance, blessing, and protection. It dispels fear and accords divine protection and bliss.",
    benefits: ["Dispels fear", "Promotes inner strength", "Cultivates peace"],
    image: "/images/mudra-abhaya.png",
    category: "spiritual",
    instructions: [
      "Raise your right hand to shoulder height.",
      "Bend the arm at the elbow.",
      "Face the palm outward with fingers upright and joined.",
      "The left hand can rest by your side or in another mudra."
    ]
  }
];

export const journals = [
  {
    id: 1,
    date: "2024-05-12",
    title: "Morning Stillness",
    duration: "2:14",
    mood: "calm"
  },
  {
    id: 2,
    date: "2024-05-10",
    title: "Releasing Anxiety",
    duration: "4:30",
    mood: "anxious"
  }
];
