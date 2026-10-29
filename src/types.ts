export interface EmotionAnalysis {
  primaryEmotion: string;
  emotionEmoji: string;
  secondaryEmotions: string[];
  valence: number; // -1.0 to 1.0
  energyLevel: '낮음' | '보통' | '높음' | string;
  stressLevel: number; // 1 to 10
  summaryReason: string;
  detectedKeywords: string[];
}

export interface AdvicePrescription {
  title: string;
  actionableSteps: string[];
  perspectiveShift: string;
  quote: string;
}

export interface RecommendedActivity {
  name: string;
  duration: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emotionAnalysis?: EmotionAnalysis;
  advice?: AdvicePrescription;
  recommendedActivity?: RecommendedActivity;
  suggestedReplies?: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  selectedEmotions: string[];
  analysis?: {
    empathyResponse: string;
    emotionAnalysis: EmotionAnalysis;
    advice: AdvicePrescription;
    recommendedActivity: RecommendedActivity;
  };
}
