import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService.js';
import { storageService } from '../services/storageService.js';
import { youtubeService } from '../services/youtubeService.js';

export const analyzePrompt = async (req: Request, res: Response) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid prompt string is required' });
    }

    const user = await storageService.getUser(userId || 'guest');
    const result = await geminiService.analyzeMusicPrompt(prompt, {
      favouriteGenres: user.favouriteGenres,
      preferredLanguages: user.preferredLanguages,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in analyzePrompt:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze prompt with AI',
      error: error.message,
    });
  }
};

export const chatWithAi = async (req: Request, res: Response) => {
  try {
    const { message, history, userId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid message string is required' });
    }

    const user = await storageService.getUser(userId || 'guest');
    const aiResult = await geminiService.chatMusic(message, history || [], {
      favouriteGenres: user.favouriteGenres,
      preferredLanguages: user.preferredLanguages,
    });

    // If music queries were generated, fetch the real songs via youtubeService!
    let songs: any[] = [];
    if (aiResult.isMusicRelated && aiResult.musicQueries.length > 0) {
      try {
        const topQueries = aiResult.musicQueries.slice(0, 2);
        const songPromises = topQueries.map((q) =>
          youtubeService.searchSongs(q, 3).catch(() => [])
        );
        const searchBatches = await Promise.all(songPromises);
        const allFound = searchBatches.flat();

        // Deduplicate songs by videoId
        const seen = new Set<string>();
        for (const s of allFound) {
          if (!seen.has(s.videoId)) {
            seen.add(s.videoId);
            songs.push(s);
          }
        }
        // Limit to 6 top songs
        songs = songs.slice(0, 6);
      } catch (err: any) {
        console.warn('[aiController] Error fetching songs for chat:', err?.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        reply: aiResult.reply,
        songs,
        suggestedPrompts: aiResult.suggestedPrompts,
        detectedMood: aiResult.detectedMood,
        isMusicRelated: aiResult.isMusicRelated,
        provider: aiResult.provider,
      },
    });
  } catch (error: any) {
    console.error('Error in chatWithAi:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat with AI',
      error: error.message,
    });
  }
};
