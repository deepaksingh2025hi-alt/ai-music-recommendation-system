import { Request, Response } from 'express';
import { storageService } from '../services/storageService.js';

export const getPlaylists = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'guest';
    const playlists = await storageService.getPlaylists(userId);
    return res.status(200).json({ success: true, count: playlists.length, data: playlists });
  } catch (error: any) {
    console.error('Error in getPlaylists:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch playlists', error: error.message });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const playlist = await storageService.getPlaylistById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    return res.status(200).json({ success: true, data: playlist });
  } catch (error: any) {
    console.error('Error in getPlaylistById:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch playlist', error: error.message });
  }
};

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { title, description, mood, songs, coverImage, isAiGenerated, userId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Playlist title is required' });
    }

    const playlist = await storageService.createPlaylist({
      title: title.trim(),
      description,
      mood,
      songs,
      coverImage,
      isAiGenerated,
      userId: userId || 'guest',
    });

    return res.status(201).json({ success: true, message: 'Playlist created successfully', data: playlist });
  } catch (error: any) {
    console.error('Error in createPlaylist:', error);
    return res.status(500).json({ success: false, message: 'Failed to create playlist', error: error.message });
  }
};

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await storageService.updatePlaylist(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    return res.status(200).json({ success: true, message: 'Playlist updated successfully', data: updated });
  } catch (error: any) {
    console.error('Error in updatePlaylist:', error);
    return res.status(500).json({ success: false, message: 'Failed to update playlist', error: error.message });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await storageService.deletePlaylist(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    return res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error: any) {
    console.error('Error in deletePlaylist:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete playlist', error: error.message });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { song } = req.body;

    if (!song || !song.videoId || !song.title) {
      return res.status(400).json({ success: false, message: 'Valid song object is required' });
    }

    const updated = await storageService.addSongToPlaylist(id, song);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    return res.status(200).json({ success: true, message: 'Song added to playlist', data: updated });
  } catch (error: any) {
    console.error('Error in addSongToPlaylist:', error);
    return res.status(500).json({ success: false, message: 'Failed to add song to playlist', error: error.message });
  }
};

export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const { id, videoId } = req.params;

    const updated = await storageService.removeSongFromPlaylist(id, videoId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    return res.status(200).json({ success: true, message: 'Song removed from playlist', data: updated });
  } catch (error: any) {
    console.error('Error in removeSongFromPlaylist:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove song from playlist', error: error.message });
  }
};

