export interface TarotCard {
  id: number;
  nameRu: string;
  nameEn: string;
  arcanaType: "major" | "minor";
  imagePrompt: string; // Used for aesthetic style hints or SVG rendering
  uprightKeywords: string[];
  reversedKeywords: string[];
  description: string;
  meaningGeneral: string;
  meaningLove: string;
  meaningFinance: string;
  advice: string;
  svgPathName: string; // Maps to specialized inline illustrative representations
}

export type SpreadType = "one_card" | "three_cards" | "celtic_cross" | "love_spread" | "finance_spread" | "future_spread";

export interface SpreadConfig {
  id: SpreadType;
  name: string;
  description: string;
  cardCount: number;
  energyCost: number;
  positions: string[];
}

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  languageCode?: string;
}

export interface UserStats {
  totalReadings: number;
  favoriteCardId: number | null;
  experiencePoints: number;
  level: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefill: string; // ISO String
}

export interface HistoryRecord {
  id: string; // uuid or unique string
  date: string;
  spreadType: SpreadType;
  spreadName: string;
  cards: {
    cardId: number;
    isReversed: boolean;
    positionName: string;
  }[];
  aiInterpretation?: string;
  manualRating?: number; // 1-5 stars if rated
}

export interface CompatibilityResult {
  nameOne: string;
  nameTwo: string;
  percentage: number;
  lovePercentage: number;
  spiritualPercentage: number;
  elementsMatch: string; // e.g. "Огонь и Воздух"
  summary: string;
  recommendations: string[];
  magicalAspect: string;
}
