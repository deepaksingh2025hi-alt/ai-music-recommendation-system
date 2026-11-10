import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, Playlist, UserProfile } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: UserProfile | null;
  likedSongIds: Set<string>;
  favourites: Song[];
  playlists: Playlist[];
  history: Song[];
  searchHistory: string[];
  loadingUser: boolean;
  toggleLike: (song: Song) => Promise<boolean>;
  isLiked: (videoId: string) => boolean;
  refreshPlaylists: () => Promise<void>;
  refreshFavourites: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  updatePreferences: (updates: Partial<UserProfile>) => Promise<void>;
  addSongToHistory: (song: Song) => Promise<void>;
  addSearchQuery: (query: string) => void;
  removeSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
}

const SEARCH_HISTORY_KEY = 'aurapulse_search_history';

const getStoredSearchHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    return [];
  } catch {
    return [];
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favourites, setFavourites] = useState<Song[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(getStoredSearchHistory);
  const [loadingUser, setLoadingUser] = useState(true);
  const { showToast } = useToast();

  const fetchInitialData = async () => {
    try {
      setLoadingUser(true);
      const [userData, favs, plists, hist] = await Promise.all([
        api.getUserProfile('guest'),
        api.getFavourites('guest'),
        api.getPlaylists('guest'),
        api.getHistory('guest', 25),
      ]);

      setUser(userData);
      setFavourites(favs);
      setLikedSongIds(new Set(favs.map((f) => f.videoId)));
      setPlaylists(plists);
      setHistory(hist);
    } catch (err: any) {
      console.warn('Error fetching initial user context data:', err?.message);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const refreshPlaylists = async () => {
    try {
      const plists = await api.getPlaylists('guest');
      setPlaylists(plists);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshFavourites = async () => {
    try {
      const favs = await api.getFavourites('guest');
      setFavourites(favs);
      setLikedSongIds(new Set(favs.map((f) => f.videoId)));
    } catch (e) {
      console.error(e);
    }
  };

  const refreshHistory = async () => {
    try {
      const hist = await api.getHistory('guest', 25);
      setHistory(hist);
    } catch (e) {
      console.error(e);
    }
  };

  const isLiked = (videoId: string) => likedSongIds.has(videoId);

  const toggleLike = async (song: Song): Promise<boolean> => {
    const currentlyLiked = isLiked(song.videoId);
    try {
      if (currentlyLiked) {
        await api.removeFavourite(song.videoId, 'guest');
        setLikedSongIds((prev) => {
          const next = new Set(prev);
          next.delete(song.videoId);
          return next;
        });
        setFavourites((prev) => prev.filter((s) => s.videoId !== song.videoId));
        showToast('Removed from Liked Songs', 'info');
        return false;
      } else {
        await api.addFavourite(song, 'guest');
        setLikedSongIds((prev) => new Set(prev).add(song.videoId));
        setFavourites((prev) => [song, ...prev]);
        showToast('Added to Liked Songs', 'success');
        return true;
      }
    } catch (err) {
      showToast('Failed to update liked songs', 'error');
      return currentlyLiked;
    }
  };

  const addSongToHistory = async (song: Song) => {
    try {
      await api.addHistory(song, 'guest');
      setHistory((prev) => [song, ...prev.filter((s) => s.videoId !== song.videoId)]);
    } catch (e) {
      console.warn('Failed to add to history:', e);
    }
  };

  const updatePreferences = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.updateUserProfile(updates, 'guest');
      setUser(updated);
      showToast('Preferences updated successfully', 'success');
    } catch (err) {
      showToast('Failed to save preferences', 'error');
    }
  };

  const addSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const safe = Array.isArray(prev) ? prev : [];
      const filtered = safe.filter(
        (item) => typeof item === 'string' && item.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save search history', e);
      }
      return updated;
    });
  };

  const removeSearchQuery = (query: string) => {
    setSearchHistory((prev) => {
      const safe = Array.isArray(prev) ? prev : [];
      const updated = safe.filter((item) => item !== query);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update search history', e);
      }
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {
      console.warn('Failed to clear search history', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        likedSongIds,
        favourites,
        playlists,
        history,
        searchHistory,
        loadingUser,
        toggleLike,
        isLiked,
        refreshPlaylists,
        refreshFavourites,
        refreshHistory,
        updatePreferences,
        addSongToHistory,
        addSearchQuery,
        removeSearchQuery,
        clearSearchHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

