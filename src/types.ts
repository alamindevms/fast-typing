export interface Lesson {
  id: string;
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  text: string;
}

export interface TestResult {
  id: string;
  mode: "lesson" | "test" | "game";
  category: string; // "Home Row Lesson", "Famous Quotes", "Custom AI Text", etc.
  wpm: number;
  accuracy: number;
  elapsedTime: number; // in seconds
  charsTyped: number;
  errors: number;
  date: string;
}

export interface GameWord {
  id: string;
  text: string;
  x: number; // horizontal position percentage (10% to 85%)
  y: number; // vertical drop position percentage (0% to 100%)
  speed: number; // speed of descent
}

export type TypingLevel = "easy" | "medium" | "hard";

export interface PresetTexts {
  [key: string]: {
    name: string;
    level: TypingLevel;
    text: string;
  }[];
}
