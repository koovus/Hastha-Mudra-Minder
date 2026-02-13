export type MudraCategory = "calming" | "energizing" | "healing" | "spiritual";

export interface MudraType {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  benefits: string[];
  image: string | null;
  category: string;
  instructions: string[];
  isBuiltIn: boolean;
  createdAt: string;
}

export interface JournalEntryType {
  id: string;
  title: string;
  audioUrl: string | null;
  duration: string;
  mood: string | null;
  burnAt: string | null;
  burnedAt: string | null;
  createdAt: string;
}
