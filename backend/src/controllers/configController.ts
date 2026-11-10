import { Request, Response } from 'express';
import { config, updateRuntimeKeys } from '../config/env.js';
import { isConnectedToMongo } from '../config/db.js';

export const getSystemStatus = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    data: {
      hasYoutubeApiKey: Boolean(config.youtubeApiKey && config.youtubeApiKey.length > 5),
      hasGeminiApiKey: Boolean(config.geminiApiKey && config.geminiApiKey.length > 5),
      isMongoConnected: isConnectedToMongo,
      port: config.port,
    },
  });
};

export const updateKeys = async (req: Request, res: Response) => {
  try {
    const { youtubeApiKey, geminiApiKey } = req.body;
    updateRuntimeKeys(youtubeApiKey, geminiApiKey);

    return res.status(200).json({
      success: true,
      message: 'API configuration updated successfully',
      data: {
        hasYoutubeApiKey: Boolean(config.youtubeApiKey),
        hasGeminiApiKey: Boolean(config.geminiApiKey),
      },
    });
  } catch (error: any) {
    console.error('Error updating keys:', error);
    return res.status(500).json({ success: false, message: 'Failed to update keys', error: error.message });
  }
};

