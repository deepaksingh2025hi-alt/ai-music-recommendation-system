import { Request, Response } from 'express';
import { storageService } from '../services/storageService.js';

export const getFavourites = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const favs = await storageService.getFavourites(userId);
    return res.status(200).json({ success: true, count: favs.length, data: favs });
  } catch (error: any) {
    console.error('Error in getFavourites:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch favourites', error: error.message });
  }
};

export const addFavourite = async (req: Request, res: Response) => {
  try {
    const { videoId, title, artist, thumbnail, duration, userId } = req.body;
    if (!videoId || !title) {
      return res.status(400).json({ success: false, message: 'videoId and title are required' });
    }

    const fav = await storageService.addFavourite(userId || 'guest', {
      videoId,
      title,
      artist: artist || 'Unknown Artist',
      thumbnail,
      duration,
    });

    return res.status(201).json({ success: true, message: 'Song added to favourites', data: fav });
  } catch (error: any) {
    console.error('Error in addFavourite:', error);
    return res.status(500).json({ success: false, message: 'Failed to add favourite', error: error.message });
  }
};

export const removeFavourite = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = (req.query.userId as string) || 'guest';

    await storageService.removeFavourite(userId, videoId);
    return res.status(200).json({ success: true, message: 'Song removed from favourites' });
  } catch (error: any) {
    console.error('Error in removeFavourite:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove favourite', error: error.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const limit = parseInt((req.query.limit as string) || '30', 10);
    const history = await storageService.getHistory(userId, limit);
    return res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error: any) {
    console.error('Error in getHistory:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
  }
};

export const addHistory = async (req: Request, res: Response) => {
  try {
    const { videoId, title, artist, thumbnail, duration, userId } = req.body;
    if (!videoId || !title) {
      return res.status(400).json({ success: false, message: 'videoId and title are required' });
    }

    const item = await storageService.addHistory(userId || 'guest', {
      videoId,
      title,
      artist: artist || 'Unknown Artist',
      thumbnail,
      duration,
    });

    return res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error in addHistory:', error);
    return res.status(500).json({ success: false, message: 'Failed to add history item', error: error.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const user = await storageService.getUser(userId);
    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error('Error in getUserProfile:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile', error: error.message });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const updates = req.body;
    const user = await storageService.updateUserPreferences(userId, updates);
    return res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error: any) {
    console.error('Error in updateUserProfile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user profile', error: error.message });
  }
};

