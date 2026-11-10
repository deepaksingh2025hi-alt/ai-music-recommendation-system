import fs from 'fs';
import path from 'path';
import { User, IUser } from '../models/User.js';
import { Playlist, IPlaylist, ISong } from '../models/Playlist.js';
import { Favourite, IFavourite } from '../models/Favourite.js';
import { ListeningHistory, IListeningHistory } from '../models/ListeningHistory.js';
import { isConnectedToMongo } from '../config/db.js';

interface LocalDB {
  users: any[];
  playlists: any[];
  favourites: any[];
  history: any[];
}

const dataDir = path.resolve(process.cwd(), 'data');
const localDbPath = path.join(dataDir, 'local_db.json');

const defaultUser = {
  _id: 'guest_user_1',
  name: 'Guest Explorer',
  email: 'guest@aurapulse.ai',
  preferences: { energyPreference: 'balanced', autoPlay: true, theme: 'dark-violet' },
  favouriteGenres: ['Lo-Fi', 'Pop', 'Indie', 'Bollywood'],
  preferredLanguages: ['English', 'Hindi'],
};

// Seed default playlists if empty
const defaultPlaylists = [
  {
    _id: 'default_pl_1',
    userId: 'guest',
    title: 'Late Night Chill & Lo-Fi',
    description: 'Calm beats and mellow melodies to relax or study late at night.',
    mood: 'Chill',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    isAiGenerated: true,
    songs: [
      {
        videoId: 'jfKfPfyJRdk',
        title: 'lofi hip hop radio 📚 - beats to relax/study to',
        artist: 'Lofi Girl',
        thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
        duration: 'Live',
        channelTitle: 'Lofi Girl',
      },
      {
        videoId: '5qap5aO4i9A',
        title: 'Lofi Hip Hop Radio - Beats to Sleep/Chill to',
        artist: 'Lofi Girl',
        thumbnail: 'https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg',
        duration: 'Live',
        channelTitle: 'Lofi Girl',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'default_pl_2',
    userId: 'guest',
    title: 'Peaceful Hindi Acoustic',
    description: 'Soulful acoustic Hindi songs and heartfelt melodies.',
    mood: 'Peaceful',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    isAiGenerated: true,
    songs: [
      {
        videoId: 'sAzlWScHTc4',
        title: 'Kesariya - Brahmāstra | Ranbir | Alia | Pritam | Arijit Singh',
        artist: 'Sony Music India',
        thumbnail: 'https://i.ytimg.com/vi/sAzlWScHTc4/hqdefault.jpg',
        duration: '4:28',
        channelTitle: 'Sony Music India',
      },
      {
        videoId: 'BddP6PYo2gs',
        title: 'Apna Bana Le - Bhediya | Varun Dhawan, Kriti Sanon | Arijit Singh',
        artist: 'Zee Music Company',
        thumbnail: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
        duration: '4:21',
        channelTitle: 'Zee Music Company',
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class StorageService {
  private localDb: LocalDB = {
    users: [defaultUser],
    playlists: [...defaultPlaylists],
    favourites: [],
    history: [],
  };

  constructor() {
    this.loadLocalDb();
  }

  private loadLocalDb() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(localDbPath)) {
        const raw = fs.readFileSync(localDbPath, 'utf-8');
        this.localDb = JSON.parse(raw);
        if (!this.localDb.playlists || this.localDb.playlists.length === 0) {
          this.localDb.playlists = [...defaultPlaylists];
          this.saveLocalDb();
        }
      } else {
        this.saveLocalDb();
      }
    } catch (e) {
      console.error('Error loading local DB fallback:', e);
    }
  }

  private saveLocalDb() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(localDbPath, JSON.stringify(this.localDb, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving local DB fallback:', e);
    }
  }

  // USER
  async getUser(userId: string = 'guest') {
    if (isConnectedToMongo) {
      try {
        let user = await User.findOne();
        if (!user) {
          const { _id, ...userData } = defaultUser;
          user = await User.create(userData);
        }
        return user;
      } catch (err: any) {
        console.warn('Error fetching or creating user in Mongo, using default:', err.message);
        return this.localDb.users[0] || defaultUser;
      }
    }
    return this.localDb.users[0] || defaultUser;
  }

  async updateUserPreferences(userId: string = 'guest', updates: any) {
    if (isConnectedToMongo) {
      try {
        let user = await User.findOne();
        if (!user) {
          const { _id, ...userData } = defaultUser;
          user = new User({ ...userData, ...updates });
        } else {
          if (updates.favouriteGenres) user.favouriteGenres = updates.favouriteGenres;
          if (updates.preferredLanguages) user.preferredLanguages = updates.preferredLanguages;
          if (updates.preferences) user.preferences = { ...user.preferences, ...updates.preferences };
          if (updates.name) user.name = updates.name;
        }
        await user.save();
        return user;
      } catch (err) {
        console.warn('Error updating user in Mongo, updating local:', err);
      }
    }
    const user = this.localDb.users[0] || { ...defaultUser };
    if (updates.favouriteGenres) user.favouriteGenres = updates.favouriteGenres;
    if (updates.preferredLanguages) user.preferredLanguages = updates.preferredLanguages;
    if (updates.preferences) user.preferences = { ...user.preferences, ...updates.preferences };
    if (updates.name) user.name = updates.name;
    this.localDb.users[0] = user;
    this.saveLocalDb();
    return user;
  }

  // PLAYLISTS
  async getPlaylists(userId: string = 'guest') {
    if (isConnectedToMongo) {
      try {
        const list = await Playlist.find({ userId }).sort({ updatedAt: -1 });
        if (list.length === 0) {
          // Seed default playlists to mongo without hardcoded string ObjectId
          for (const pl of defaultPlaylists) {
            const { _id, ...plData } = pl;
            await Playlist.create(plData);
          }
          return await Playlist.find({ userId }).sort({ updatedAt: -1 });
        }
        return list;
      } catch (err) {
        console.warn('Error in getPlaylists from Mongo, using local fallback:', err);
      }
    }
    return this.localDb.playlists.filter((p) => p.userId === userId || userId === 'guest');
  }

  async getPlaylistById(id: string) {
    if (isConnectedToMongo) {
      return await Playlist.findById(id);
    }
    return this.localDb.playlists.find((p) => p._id === id || p.id === id) || null;
  }

  async createPlaylist(data: {
    userId?: string;
    title: string;
    description?: string;
    mood?: string;
    songs?: ISong[];
    coverImage?: string;
    isAiGenerated?: boolean;
  }) {
    const playlistData = {
      userId: data.userId || 'guest',
      title: data.title,
      description: data.description || '',
      mood: data.mood || 'Custom',
      songs: data.songs || [],
      coverImage:
        data.coverImage ||
        (data.songs && data.songs[0]?.thumbnail) ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      isAiGenerated: data.isAiGenerated || false,
    };

    if (isConnectedToMongo) {
      return await Playlist.create(playlistData);
    }

    const newPl = {
      ...playlistData,
      _id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.localDb.playlists.unshift(newPl);
    this.saveLocalDb();
    return newPl;
  }

  async updatePlaylist(id: string, updates: Partial<IPlaylist>) {
    if (isConnectedToMongo) {
      return await Playlist.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
    }
    const idx = this.localDb.playlists.findIndex((p) => p._id === id || p.id === id);
    if (idx !== -1) {
      this.localDb.playlists[idx] = {
        ...this.localDb.playlists[idx],
        ...updates,
        updatedAt: new Date(),
      };
      this.saveLocalDb();
      return this.localDb.playlists[idx];
    }
    return null;
  }

  async deletePlaylist(id: string) {
    if (isConnectedToMongo) {
      return await Playlist.findByIdAndDelete(id);
    }
    const initialLen = this.localDb.playlists.length;
    this.localDb.playlists = this.localDb.playlists.filter((p) => p._id !== id && p.id !== id);
    this.saveLocalDb();
    return this.localDb.playlists.length < initialLen;
  }

  async addSongToPlaylist(playlistId: string, song: ISong) {
    if (isConnectedToMongo) {
      const pl = await Playlist.findById(playlistId);
      if (!pl) return null;
      // Prevent duplicates
      const exists = pl.songs.some((s) => s.videoId === song.videoId);
      if (!exists) {
        pl.songs.push(song);
        if (!pl.coverImage) pl.coverImage = song.thumbnail;
        await pl.save();
      }
      return pl;
    }
    const pl = this.localDb.playlists.find((p) => p._id === playlistId || p.id === playlistId);
    if (!pl) return null;
    const exists = pl.songs.some((s: any) => s.videoId === song.videoId);
    if (!exists) {
      pl.songs.push(song);
      if (!pl.coverImage) pl.coverImage = song.thumbnail;
      pl.updatedAt = new Date();
      this.saveLocalDb();
    }
    return pl;
  }

  async removeSongFromPlaylist(playlistId: string, videoId: string) {
    if (isConnectedToMongo) {
      const pl = await Playlist.findById(playlistId);
      if (!pl) return null;
      pl.songs = pl.songs.filter((s) => s.videoId !== videoId);
      await pl.save();
      return pl;
    }
    const pl = this.localDb.playlists.find((p) => p._id === playlistId || p.id === playlistId);
    if (!pl) return null;
    pl.songs = pl.songs.filter((s: any) => s.videoId !== videoId);
    pl.updatedAt = new Date();
    this.saveLocalDb();
    return pl;
  }

  // FAVOURITES
  async getFavourites(userId: string = 'guest') {
    if (isConnectedToMongo) {
      return await Favourite.find({ userId }).sort({ createdAt: -1 });
    }
    return this.localDb.favourites.filter((f) => f.userId === userId || userId === 'guest');
  }

  async addFavourite(userId: string = 'guest', song: { videoId: string; title: string; artist: string; thumbnail: string; duration?: string }) {
    if (isConnectedToMongo) {
      const existing = await Favourite.findOne({ userId, videoId: song.videoId });
      if (existing) return existing;
      return await Favourite.create({ userId, ...song });
    }
    const existing = this.localDb.favourites.find((f) => f.videoId === song.videoId);
    if (existing) return existing;
    const newFav = {
      _id: 'fav_' + Date.now(),
      userId,
      ...song,
      createdAt: new Date(),
    };
    this.localDb.favourites.unshift(newFav);
    this.saveLocalDb();
    return newFav;
  }

  async removeFavourite(userId: string = 'guest', videoId: string) {
    if (isConnectedToMongo) {
      return await Favourite.findOneAndDelete({ userId, videoId });
    }
    this.localDb.favourites = this.localDb.favourites.filter((f) => f.videoId !== videoId);
    this.saveLocalDb();
    return true;
  }

  // HISTORY
  async getHistory(userId: string = 'guest', limit: number = 30) {
    if (isConnectedToMongo) {
      return await ListeningHistory.find({ userId }).sort({ playedAt: -1 }).limit(limit);
    }
    return this.localDb.history.slice(0, limit);
  }

  async addHistory(userId: string = 'guest', song: { videoId: string; title: string; artist: string; thumbnail: string; duration?: string }) {
    if (isConnectedToMongo) {
      // Remove recent duplicate if played within last hour to keep history clean
      await ListeningHistory.deleteMany({
        userId,
        videoId: song.videoId,
        playedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });
      return await ListeningHistory.create({
        userId,
        ...song,
        playedAt: new Date(),
      });
    }
    // Remove if recent duplicate in localDb
    this.localDb.history = this.localDb.history.filter((h) => h.videoId !== song.videoId);
    const newH = {
      _id: 'hist_' + Date.now(),
      userId,
      ...song,
      playedAt: new Date(),
    };
    this.localDb.history.unshift(newH);
    if (this.localDb.history.length > 100) {
      this.localDb.history = this.localDb.history.slice(0, 100);
    }
    this.saveLocalDb();
    return newH;
  }
}

export const storageService = new StorageService();

