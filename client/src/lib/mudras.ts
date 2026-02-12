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
