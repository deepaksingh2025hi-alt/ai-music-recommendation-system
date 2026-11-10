import axios from 'axios';
import { config } from '../config/env.js';
import { parseYouTubeDuration } from '../utils/durationParser.js';
import { decodeHtmlEntities } from '../utils/htmlDecoder.js';
import { normalizeQueryTypo } from '../utils/queryNormalizer.js';

export interface YouTubeSong {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
  isEmbeddable: boolean;
  publishedAt?: string;
  source: 'official-api' | 'public-stream';
}

/**
 * Identify whether a video is an unofficial multi-song compilation,
 * 1-hour/2-hour jukebox, or full album playlist video rather than an individual hit song.
 */
export const isJukeboxOrCompilation = (song: { title: string; duration?: string; channelTitle?: string }): boolean => {
  const title = (song.title || '').toLowerCase();
  const channel = (song.channelTitle || '').toLowerCase();
  const duration = song.duration || '';

  // Explicit compilation / jukebox keywords in title
  const compilationPatterns = /\b(jukebox|all songs|full album|full songs|audio jukebox|video jukebox|movie songs jukebox|non stop|complete album|mega mix|discography|mashup|best of|all video songs|romantic songs collection|audio collection|hit songs collection|top 10|top 20|top 50|top 100|evergreen songs|evergreen hits|90s hits|90's hits|superhit songs|all audio songs|playlist|album song|album songs|video song collection|sad songs collection|love songs collection|video songs|full video songs|movie songs)\b/i;

  if (compilationPatterns.test(title)) {
    return true;
  }

  // Duration check: standard songs are rarely over 7:30 mins
  if (duration) {
    const parts = duration.split(':');
    if (parts.length > 2) {
      // Format hh:mm:ss -> definitely a compilation/full album (e.g. 1:15:30)
      return true;
    } else if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      if (!isNaN(minutes) && minutes >= 8) {
        // >= 8:00 is almost always a compilation or full album
        return true;
      }
    }
  }

  // Compilation channel names created by third parties
  const compilationChannels = /\b(hit hindi songs|old songs collection|songs collection|retro hits|best bollywood songs|hindi audio songs)\b/i;
  if (compilationChannels.test(channel)) {
    return true;
  }

  return false;
};

interface CacheItem {
  timestamp: number;
  data: YouTubeSong[];
}

export class YouTubeService {
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Ensure query strictly targets music, audio tracks, and songs
   */
  private ensureMusicQuery(query: string): string {
    const q = query.trim();
    if (/^(gym|workout|fitness|exercise|pump|bodybuilding|training)$/i.test(q)) {
      return `${q} workout motivational music songs`;
    }
    const musicTokens = /music|song|songs|track|tracks|audio|soundtrack|remix|beats|lofi|phonk|anthem|acoustic/i;
    if (!musicTokens.test(q)) {
      return `${q} music songs official audio`;
    }
    return q;
  }

  /**
   * Filter out fitness tutorials, exercise guides, workout instructions, vlogs, and podcasts
   */
  private isNonMusicVideo(title: string, channelTitle: string = ''): boolean {
    const combined = `${title} ${channelTitle}`.toLowerCase();

    const nonMusicPattern = /\b(how to|tutorial|technique|form check|exercises? guide|workout routine|at home workout|diet plan|beginner workout|speech motivation|podcast|episode|vlog|interview|reaction|review|unboxing|bodybuilding competition|mr olympia|day in the life|chest workout|bicep workout|tricep workout|leg day workout|shoulder workout|abs workout|cardio routine|warm up|cool down|full body workout|push pull legs|physique update|fitness trainer|exercise routine|workout with me|sets and reps|reps and sets|calisthenics tutorial|gym guide|weight loss tips|full workout|follow along workout)\b/i;

    if (nonMusicPattern.test(combined)) {
      // If it mentions exercises/tutorials, only allow if the title explicitly states it is a music track/mix
      const hasExplicitMusicToken = /\b(music|songs?|remix|beats?|soundtrack|audio|track|tracks|phonk|mix|bass boosted|playlist)\b/i.test(title);
      if (!hasExplicitMusicToken) {
        return true;
      }
    }

    return false;
  }

  /**
   * Search songs with caching, debouncing support, and official YouTube API v3 with intelligent fallback
   */
  async searchSongs(query: string, maxResults: number = 10): Promise<YouTubeSong[]> {
    const normalized = normalizeQueryTypo(query);
    const sanitizedQuery = this.ensureMusicQuery(normalized);
    const cacheKey = `${sanitizedQuery.toLowerCase().trim()}_${maxResults}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    let results: YouTubeSong[] = [];

    // Attempt official YouTube Data API v3 if API key is configured
    if (config.youtubeApiKey) {
      try {
        results = await this.searchViaOfficialApi(sanitizedQuery, maxResults);
      } catch (err: any) {
        console.warn(`[YouTubeService] Official API failed (${err?.response?.status || err?.message}). Attempting fallback search.`);
      }
    }

    // If official API didn't return results (or key not configured / quota exceeded), use resilient public search
    if (results.length === 0) {
      try {
        results = await this.searchViaPublicScraper(sanitizedQuery, maxResults);
      } catch (fallbackErr: any) {
        console.error('[YouTubeService] Fallback search also failed:', fallbackErr?.message);
      }
    }

    // Deduplicate by videoId
    const seen = new Set<string>();
    const deduplicated = results.filter((song) => {
      if (seen.has(song.videoId)) return false;
      seen.add(song.videoId);
      return true;
    });

    // Partition: Standalone individual hit songs ALWAYS appear first before multi-hour jukebox compilations
    const userExplicitlyWantsJuke = /\b(jukebox|full album|all songs|compilation|mega mix)\b/i.test(query);
    deduplicated.sort((a, b) => {
      const aJuke = isJukeboxOrCompilation(a) ? 1 : 0;
      const bJuke = isJukeboxOrCompilation(b) ? 1 : 0;
      if (userExplicitlyWantsJuke) {
        return bJuke - aJuke;
      }
      return aJuke - bJuke; // Standalone individual song (0) comes before jukebox (1)
    });

    if (deduplicated.length > 0) {
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: deduplicated,
      });
    }

    return deduplicated;
  }

  /**
   * Search using official YouTube Data API v3:
   * GET https://www.googleapis.com/youtube/v3/search
   * GET https://www.googleapis.com/youtube/v3/videos
   */
  private async searchViaOfficialApi(query: string, maxResults: number): Promise<YouTubeSong[]> {
    // 1. Search videos strictly in Music category (videoCategoryId=10)
    const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        type: 'video',
        videoCategoryId: '10', // YouTube Official Music Category
        q: query,
        maxResults: Math.min(maxResults + 15, 40), // Fetch more to allow strict standalone filtering
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        regionCode: 'IN',
        key: config.youtubeApiKey,
      },
      timeout: 8000,
    });

    const items = searchRes.data.items || [];
    if (items.length === 0) return [];

    const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);

    // 2. Fetch video details for durations and embeddability check
    let detailsMap = new Map<string, { duration: string; isEmbeddable: boolean }>();
    try {
      const detailsRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'contentDetails,status',
          id: videoIds.join(','),
          key: config.youtubeApiKey,
        },
        timeout: 8000,
      });

      for (const d of detailsRes.data.items || []) {
        const durationFormatted = parseYouTubeDuration(d.contentDetails?.duration);
        const isEmbeddable = d.status?.embeddable !== false;
        detailsMap.set(d.id, { duration: durationFormatted, isEmbeddable });
      }
    } catch (dErr) {
      console.warn('[YouTubeService] Could not fetch detailed video specs, defaulting durations');
    }

    const songs: YouTubeSong[] = [];

    for (const item of items) {
      const videoId = item.id?.videoId;
      if (!videoId) continue;

      const detail = detailsMap.get(videoId);
      if (detail && !detail.isEmbeddable) continue; // Exclude non-embeddable videos

      const title = decodeHtmlEntities(item.snippet?.title || 'Unknown Song');
      const channelTitle = decodeHtmlEntities(item.snippet?.channelTitle || 'Unknown Artist');

      // Strictly discard non-music videos (fitness tutorials, workouts, vlogs, etc.)
      if (this.isNonMusicVideo(title, channelTitle)) {
        continue;
      }

      // Filter out shorts, reaction videos, or 30-sec trailers if duration is known
      const duration = detail?.duration || '3:45';
      if (duration.startsWith('0:0') || duration === '0:15' || duration === '0:30') {
        continue;
      }

      // High-res thumbnail preference
      const thumbs = item.snippet?.thumbnails;
      const thumbnail =
        thumbs?.maxres?.url ||
        thumbs?.high?.url ||
        thumbs?.medium?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      // Clean artist name
      let artist = channelTitle.replace(/- Topic|VEVO|Official|Records|Music/gi, '').trim();
      if (!artist) artist = channelTitle;

      songs.push({
        videoId,
        title,
        artist,
        channelTitle,
        thumbnail,
        duration,
        isEmbeddable: true,
        publishedAt: item.snippet?.publishedAt,
        source: 'official-api',
      });
    }

    const userWantsJuke = /\b(jukebox|full album|all songs|compilation|mega mix)\b/i.test(query);
    const standaloneSongs = songs.filter((s) => !isJukeboxOrCompilation(s));
    const compilationSongs = songs.filter((s) => isJukeboxOrCompilation(s));

    const prioritized = userWantsJuke
      ? [...compilationSongs, ...standaloneSongs]
      : [...standaloneSongs, ...compilationSongs];

    return prioritized.slice(0, maxResults);
  }

  /**
   * Resilient public YouTube search parser extracting real video IDs, titles, channel names, and durations.
   * Scrapes the full result set so standalone hit songs are prioritized over random 1-2 hour jukebox compilations.
   */
  private async searchViaPublicScraper(query: string, maxResults: number): Promise<YouTubeSong[]> {
    const encoded = encodeURIComponent(query);
    const url = `https://www.youtube.com/results?search_query=${encoded}&sp=EgIQAQ%253D%253D`; // sp for type=video

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000,
    });

    const html: string = response.data;
    const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
      html.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);

    if (!jsonMatch) {
      return [];
    }

    const data = JSON.parse(jsonMatch[1]);
    const contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
        ?.itemSectionRenderer?.contents || [];

    const allScrapedSongs: YouTubeSong[] = [];

    // Parse ALL items returned on the page (typically 30-40 videos) without stopping prematurely
    for (const item of contents) {
      const v = item.videoRenderer;
      if (!v || !v.videoId) continue;

      const videoId = v.videoId;
      const title = v.title?.runs?.[0]?.text || '';
      const channelTitle = v.ownerText?.runs?.[0]?.text || '';
      const duration = v.lengthText?.simpleText || '3:30';

      // Avoid YouTube shorts
      if (duration === 'SHORTS' || duration.length < 3) continue;

      const thumbs = v.thumbnail?.thumbnails;
      const thumbnail =
        thumbs && thumbs.length > 0
          ? thumbs[thumbs.length - 1].url
          : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      const cleanTitle = decodeHtmlEntities(title);
      const cleanChannel = decodeHtmlEntities(channelTitle);

      // Strictly discard non-music videos (tutorials, routine vlogs, podcasts, speech)
      if (this.isNonMusicVideo(cleanTitle, cleanChannel)) {
        continue;
      }

      let artist = cleanChannel.replace(/- Topic|VEVO|Official|Records|Music/gi, '').trim();
      if (!artist) artist = cleanChannel;

      allScrapedSongs.push({
        videoId,
        title: cleanTitle,
        artist: decodeHtmlEntities(artist),
        channelTitle: cleanChannel,
        thumbnail,
        duration,
        isEmbeddable: true,
        source: 'public-stream',
      });
    }

    const userWantsJuke = /\b(jukebox|full album|all songs|compilation|mega mix)\b/i.test(query);
    const standaloneSongs = allScrapedSongs.filter((s) => !isJukeboxOrCompilation(s));
    const compilationSongs = allScrapedSongs.filter((s) => isJukeboxOrCompilation(s));

    // Standalone individual hit songs ALWAYS appear first!
    const prioritized = userWantsJuke
      ? [...compilationSongs, ...standaloneSongs]
      : [...standaloneSongs, ...compilationSongs];

    return prioritized.slice(0, maxResults);
  }

  /**
   * Get trending music in region
   */
  async getTrendingMusic(regionCode: string = 'IN', maxResults: number = 15): Promise<YouTubeSong[]> {
    const cacheKey = `trending_${regionCode}_${maxResults}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (config.youtubeApiKey) {
      try {
        const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails,status',
            chart: 'mostPopular',
            videoCategoryId: '10', // Music category
            regionCode,
            maxResults,
            key: config.youtubeApiKey,
          },
          timeout: 8000,
        });

        const songs: YouTubeSong[] = [];
        for (const item of res.data.items || []) {
          if (item.status?.embeddable === false) continue;
          const videoId = item.id;
          const title = decodeHtmlEntities(item.snippet?.title || '');
          const channelTitle = decodeHtmlEntities(item.snippet?.channelTitle || '');
          const duration = parseYouTubeDuration(item.contentDetails?.duration);
          const thumbs = item.snippet?.thumbnails;
          const thumbnail =
            thumbs?.maxres?.url ||
            thumbs?.high?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          songs.push({
            videoId,
            title,
            artist: channelTitle.replace(/- Topic|VEVO|Official/gi, '').trim() || channelTitle,
            channelTitle,
            thumbnail,
            duration,
            isEmbeddable: true,
            source: 'official-api',
          });
        }

        if (songs.length > 0) {
          this.cache.set(cacheKey, { timestamp: Date.now(), data: songs });
          return songs;
        }
      } catch (err: any) {
        console.warn(`[YouTubeService] Trending API failed (${err?.message}). Falling back to curated trending.`);
      }
    }

    // Fallback: search for top trending songs
    return this.searchSongs('trending top hit music 2026 official', maxResults);
  }
}

export const youtubeService = new YouTubeService();

