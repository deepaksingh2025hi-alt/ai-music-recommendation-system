import { geminiService, AIAnalysisResult } from './geminiService.js';
import { youtubeService, YouTubeSong, isJukeboxOrCompilation } from './youtubeService.js';
import { storageService } from './storageService.js';
import { normalizeQueryTypo } from '../utils/queryNormalizer.js';

export interface RecommendResponse {
  analysis: AIAnalysisResult;
  songs: YouTubeSong[];
  generatedPlaylist: {
    title: string;
    description: string;
    mood: string;
    coverImage: string;
    songs: YouTubeSong[];
    isAiGenerated: boolean;
  };
}

export class RecommendationService {
  /**
   * Complete AI recommendation pipeline:
   * 1. Gemini AI Analysis of prompt + preferences
   * 2. Multi-query YouTube search
   * 3. Deduplication and preference ranking
   * 4. AI playlist generation
   */
  async recommend(
    prompt: string,
    userId: string = 'guest'
  ): Promise<RecommendResponse> {
    // 1. Fetch user preferences & history
    const user = await storageService.getUser(userId);
    const favourites = await storageService.getFavourites(userId);
    const history = await storageService.getHistory(userId, 10);

    // 2. Normalize typos and run Gemini Analysis
    const normalizedPrompt = normalizeQueryTypo(prompt);
    const analysis = await geminiService.analyzeMusicPrompt(normalizedPrompt, {
      favouriteGenres: user.favouriteGenres,
      preferredLanguages: user.preferredLanguages,
    });

    // 3. Multi-query YouTube search: ALWAYS query normalized search prompt first!
    const querySet = new Set<string>();
    querySet.add(normalizedPrompt);
    if (analysis.searchQueries && analysis.searchQueries.length > 0) {
      for (const q of analysis.searchQueries) {
        querySet.add(normalizeQueryTypo(q));
      }
    }
    const queries = Array.from(querySet).slice(0, 4);

    const searchPromises = queries.map((q) => youtubeService.searchSongs(q, 7));
    const queryResults = await Promise.all(searchPromises);

    // 4. Flatten and Deduplicate
    const songMap = new Map<string, YouTubeSong>();
    for (const songs of queryResults) {
      for (const song of songs) {
        if (!songMap.has(song.videoId)) {
          songMap.set(song.videoId, song);
        }
      }
    }

    let allSongs = Array.from(songMap.values());

    // 5. Ranking based on direct query match, user preferences, and relevance
    const likedArtists = new Set(favourites.map((f: any) => f.artist.toLowerCase()));
    const recentIds = new Set(history.map((h: any) => h.videoId));
    const promptKeywords = normalizedPrompt.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    allSongs.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      const artistA = a.artist.toLowerCase();
      const artistB = b.artist.toLowerCase();

      // Highest priority: Direct match to user's search keywords (e.g. Aashiqui, Arijit)
      for (const kw of promptKeywords) {
        if (titleA.includes(kw)) scoreA += 8;
        if (artistA.includes(kw)) scoreA += 6;
        if (titleB.includes(kw)) scoreB += 8;
        if (artistB.includes(kw)) scoreB += 6;
      }

      // Heavy penalty for jukeboxes and compilations; massive boost for standalone individual songs
      const isJukeboxA = isJukeboxOrCompilation(a);
      const isJukeboxB = isJukeboxOrCompilation(b);

      if (isJukeboxA) scoreA -= 150;
      else scoreA += 40;

      if (isJukeboxB) scoreB -= 150;
      else scoreB += 40;

      // Boost official major record labels and verified channels
      const officialChannelPattern = /\b(t-series|zee music|sony music|yrf|saregama|tips|speed records|geet mp3|warner|universal|vevo)\b/i;
      if (officialChannelPattern.test(a.channelTitle)) scoreA += 25;
      if (officialChannelPattern.test(b.channelTitle)) scoreB += 25;

      // Bonus if user has liked this artist
      if (likedArtists.has(artistA)) scoreA += 3;
      if (likedArtists.has(artistB)) scoreB += 3;

      // Small penalty if heard in last 30 mins to offer fresh variety
      if (recentIds.has(a.videoId)) scoreA -= 1;
      if (recentIds.has(b.videoId)) scoreB -= 1;

      // Bonus for official audio / original song in title
      if (/official|audio|video|original/i.test(a.title)) scoreA += 2;
      if (/official|audio|video|original/i.test(b.title)) scoreB += 2;

      return scoreB - scoreA;
    });

    // If still empty (e.g. extreme query), fallback to trending
    if (allSongs.length === 0) {
      allSongs = await youtubeService.getTrendingMusic('IN', 10);
    }

    // Curate playlist cover from high-quality thumbnail of top track or aesthetic gradient
    const coverImage =
      allSongs[0]?.thumbnail ||
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';

    const generatedPlaylist = {
      title: analysis.playlistTitle,
      description: analysis.playlistDescription,
      mood: analysis.mood,
      coverImage,
      songs: allSongs,
      isAiGenerated: true,
    };

    return {
      analysis,
      songs: allSongs,
      generatedPlaylist,
    };
  }

  /**
   * Generate mood-based dashboard recommendations
   */
  async getDashboardRecommendations(userId: string = 'guest') {
    const user = await storageService.getUser(userId);
    const primaryGenre = user.favouriteGenres?.[0] || 'Pop';
    const primaryLang = user.preferredLanguages?.[0] || 'English';

    const prompt = `Top trending ${primaryLang} ${primaryGenre} hit songs`;
    return this.recommend(prompt, userId);
  }
}

export const recommendationService = new RecommendationService();

