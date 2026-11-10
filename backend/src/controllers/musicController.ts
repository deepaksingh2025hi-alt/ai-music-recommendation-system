import { Request, Response } from 'express';
import { youtubeService } from '../services/youtubeService.js';
import { recommendationService } from '../services/recommendationService.js';

export const searchMusic = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const maxResults = parseInt((req.query.maxResults as string) || '15', 10);

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: 'Search query "q" is required' });
    }

    const songs = await youtubeService.searchSongs(q.trim(), maxResults);

    return res.status(200).json({
      success: true,
      query: q,
      count: songs.length,
      data: songs,
    });
  } catch (error: any) {
    console.error('Error in searchMusic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search YouTube music',
      error: error.message,
    });
  }
};

export const recommendMusic = async (req: Request, res: Response) => {
  try {
    const { prompt, userId } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid prompt string is required' });
    }

    const result = await recommendationService.recommend(prompt, userId || 'guest');

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in recommendMusic:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message,
    });
  }
};

export const getTrending = async (req: Request, res: Response) => {
  try {
    const regionCode = (req.query.regionCode as string) || 'IN';
    const maxResults = parseInt((req.query.maxResults as string) || '15', 10);

    const songs = await youtubeService.getTrendingMusic(regionCode, maxResults);

    return res.status(200).json({
      success: true,
      regionCode,
      count: songs.length,
      data: songs,
    });
  } catch (error: any) {
    console.error('Error in getTrending:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trending music',
      error: error.message,
    });
  }
};

