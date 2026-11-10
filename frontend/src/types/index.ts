export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  channelTitle?: string;
  isEmbeddable?: boolean;
  source?: 'official-api' | 'public-stream';
}

export interface Playlist {
  _id: string;
  userId?: string;
  title: string;
  description?: string;
  mood?: string;
  songs: Song[];
  coverImage?: string;
  isAiGenerated?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIAnalysis {
  mood: string;
  genre: string;
  language: string[];
  energy: 'low' | 'medium' | 'high';
  purpose: string;
  tempo: 'slow' | 'medium' | 'fast';
  searchQueries: string[];
  playlistTitle: string;
  playlistDescription: string;
  provider: 'gemini' | 'heuristic';
}

export interface RecommendResponse {
  analysis: AIAnalysis;
  songs: Song[];
  generatedPlaylist: {
    title: string;
    description: string;
    mood: string;
    coverImage: string;
    songs: Song[];
    isAiGenerated: boolean;
  };
}

export interface UserPreferences {
  energyPreference?: string;
  autoPlay?: boolean;
  theme?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  preferences?: UserPreferences;
  favouriteGenres: string[];
  preferredLanguages: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  songs?: Song[];
  suggestedPrompts?: string[];
  detectedMood?: string;
  timestamp: number;
}

export interface ChatResponse {
  reply: string;
  songs: Song[];
  suggestedPrompts: string[];
  detectedMood?: string;
  isMusicRelated: boolean;
}

