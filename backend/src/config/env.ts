import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_music',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

// Allow runtime updating of keys from Settings UI
export const updateRuntimeKeys = (youtubeKey?: string, geminiKey?: string) => {
  if (youtubeKey !== undefined) {
    config.youtubeApiKey = youtubeKey.trim();
    process.env.YOUTUBE_API_KEY = youtubeKey.trim();
  }
  if (geminiKey !== undefined) {
    config.geminiApiKey = geminiKey.trim();
    process.env.GEMINI_API_KEY = geminiKey.trim();
  }

  // Also persist to .env if possible
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf-8');
    }
    
    // Update or append YOUTUBE_API_KEY
    if (youtubeKey !== undefined) {
      if (content.includes('YOUTUBE_API_KEY=')) {
        content = content.replace(/YOUTUBE_API_KEY=.*/g, `YOUTUBE_API_KEY=${config.youtubeApiKey}`);
      } else {
        content += `\nYOUTUBE_API_KEY=${config.youtubeApiKey}`;
      }
    }
    // Update or append GEMINI_API_KEY
    if (geminiKey !== undefined) {
      if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${config.geminiApiKey}`);
      } else {
        content += `\nGEMINI_API_KEY=${config.geminiApiKey}`;
      }
    }
    fs.writeFileSync(envPath, content.trim() + '\n', 'utf-8');
  } catch (err) {
    console.error('Failed to write .env file:', err);
  }
};

