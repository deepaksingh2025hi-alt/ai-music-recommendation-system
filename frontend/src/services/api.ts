import axios from 'axios';
import { Song, Playlist, RecommendResponse, UserProfile, AIAnalysis, ChatResponse } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

export const api = {
  // Search
  searchMusic: async (q: string, maxResults: number = 15): Promise<Song[]> => {
    const res = await client.get('/music/search', { params: { q, maxResults } });
    return res.data.data || [];
  },

  // Recommend
  recommendMusic: async (prompt: string, userId: string = 'guest'): Promise<RecommendResponse> => {
    const res = await client.post('/music/recommend', { prompt, userId });
    return res.data.data;
  },

  // AI Analyze only
  analyzePrompt: async (prompt: string, userId: string = 'guest'): Promise<AIAnalysis> => {
    const res = await client.post('/ai/analyze', { prompt, userId });
    return res.data.data;
  },

  // AI Music Chatbot
  chatWithMusicBot: async (
    message: string,
    history?: { role: 'user' | 'model'; content: string }[],
    userId: string = 'guest'
  ): Promise<ChatResponse> => {
    const res = await client.post('/ai/chat', { message, history, userId });
    return res.data.data;
  },

  // Trending
  getTrending: async (regionCode: string = 'IN', maxResults: number = 15): Promise<Song[]> => {
    const res = await client.get('/music/trending', { params: { regionCode, maxResults } });
    return res.data.data || [];
  },

  // Playlists
  getPlaylists: async (userId: string = 'guest'): Promise<Playlist[]> => {
    const res = await client.get('/playlists', { params: { userId } });
    return res.data.data || [];
  },

  getPlaylistById: async (id: string): Promise<Playlist> => {
    const res = await client.get(`/playlists/${id}`);
    return res.data.data;
  },

  createPlaylist: async (playlistData: {
    title: string;
    description?: string;
    mood?: string;
    songs?: Song[];
    coverImage?: string;
    isAiGenerated?: boolean;
    userId?: string;
  }): Promise<Playlist> => {
    const res = await client.post('/playlists', playlistData);
    return res.data.data;
  },

  updatePlaylist: async (id: string, updates: Partial<Playlist>): Promise<Playlist> => {
    const res = await client.put(`/playlists/${id}`, updates);
    return res.data.data;
  },

  deletePlaylist: async (id: string): Promise<boolean> => {
    await client.delete(`/playlists/${id}`);
    return true;
  },

  addSongToPlaylist: async (playlistId: string, song: Song): Promise<Playlist> => {
    const res = await client.post(`/playlists/${playlistId}/songs`, { song });
    return res.data.data;
  },

  removeSongFromPlaylist: async (playlistId: string, videoId: string): Promise<Playlist> => {
    const res = await client.delete(`/playlists/${playlistId}/songs/${videoId}`);
    return res.data.data;
  },

  // Favourites
  getFavourites: async (userId: string = 'guest'): Promise<Song[]> => {
    const res = await client.get('/favourites', { params: { userId } });
    return res.data.data || [];
  },

  addFavourite: async (song: Song, userId: string = 'guest'): Promise<any> => {
    const res = await client.post('/favourites', { ...song, userId });
    return res.data.data;
  },

  removeFavourite: async (videoId: string, userId: string = 'guest'): Promise<boolean> => {
    await client.delete(`/favourites/${videoId}`, { params: { userId } });
    return true;
  },

  // History
  getHistory: async (userId: string = 'guest', limit: number = 30): Promise<Song[]> => {
    const res = await client.get('/history', { params: { userId, limit } });
    return res.data.data || [];
  },

  addHistory: async (song: Song, userId: string = 'guest'): Promise<any> => {
    const res = await client.post('/history', { ...song, userId });
    return res.data.data;
  },

  // User Profile
  getUserProfile: async (userId: string = 'guest'): Promise<UserProfile> => {
    const res = await client.get('/profile', { params: { userId } });
    return res.data.data;
  },

  updateUserProfile: async (updates: Partial<UserProfile>, userId: string = 'guest'): Promise<UserProfile> => {
    const res = await client.put('/profile', updates, { params: { userId } });
    return res.data.data;
  },

  // System Configuration & Keys
  getConfigStatus: async () => {
    const res = await client.get('/config/status');
    return res.data.data;
  },

  updateKeys: async (youtubeApiKey?: string, geminiApiKey?: string) => {
    const res = await client.post('/config/keys', { youtubeApiKey, geminiApiKey });
    return res.data.data;
  },
};

