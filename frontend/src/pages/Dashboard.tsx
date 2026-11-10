import React, { useState, useEffect } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { Song, Playlist } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HeroFeatured } from '../components/hero/HeroFeatured';
import { SongCard } from '../components/music/SongCard';
import { LeftSidebarWidgets } from '../components/music/LeftSidebarWidgets';
import { normalizeQueryTypo } from '../utils/queryNormalizer';

interface DashboardProps {
  onSelectPlaylist: (playlist: Playlist) => void;
  onOpenCreatePlaylist: () => void;
  onOpenAddToPlaylist: (song: Song) => void;
  onNavigateTab: (tab: string) => void;
  onTriggerSearch: (query: string) => void;
  activeCategory: string;
}

// Default Seed Tracks Matching Reference UI exactly
const SEED_HERO_PLAYLIST: Playlist = {
  _id: 'seed_hero_spiderman',
  title: 'Spider-Man: Across the Spider-Verse',
  description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
  mood: 'Animation',
  coverImage: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&auto=format&fit=crop&q=80',
  isAiGenerated: true,
  songs: [
    {
      videoId: 'ApXoWvfEYVU',
      title: 'Sunflower - Spider-Man: Into the Spider-Verse',
      artist: 'Post Malone, Swae Lee',
      thumbnail: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
      duration: '2:38',
      channelTitle: 'Post Malone',
    },
    {
      videoId: 'O2C59uBSpYg',
      title: 'Am I Dreaming - Metro Boomin, A$AP Rocky, Roisee',
      artist: 'Metro Boomin',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      duration: '4:16',
      channelTitle: 'Metro Boomin',
    },
    {
      videoId: 'n4DE_gVbYj0',
      title: 'Calling - Metro Boomin, Swae Lee, NAV, A Boogie',
      artist: 'Metro Boomin',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      duration: '3:39',
      channelTitle: 'Metro Boomin',
    },
  ],
};

const SEED_TRENDING: Song[] = [
  {
    videoId: 'bO8KaL_H2kM',
    title: 'The Last Kingdom: Seven Kings Must Die',
    artist: 'Eivør & John Lunn',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    duration: '3:45',
    channelTitle: 'Universal Pictures Music',
  },
  {
    videoId: 'aW7bzd8uwyQ',
    title: 'The Super Mario Bros. Movie - Peaches',
    artist: 'Jack Black',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    duration: '1:45',
    channelTitle: 'Illumination',
  },
  {
    videoId: 'ApXoWvfEYVU',
    title: 'Sunflower - Post Malone, Swae Lee',
    artist: 'Post Malone, Swae Lee',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    duration: '2:38',
    channelTitle: 'Post Malone',
  },
];

const SEED_HISTORY: Song[] = [
  {
    videoId: '66VnOdk6oto',
    title: 'Dark Season 3 - Goodbye',
    artist: 'Apparat, Soap&Skin',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
    duration: '4:15',
    channelTitle: 'Apparat',
  },
  {
    videoId: '4H0JDomvPac',
    title: 'Transformers - Arrival To Earth',
    artist: 'Steve Jablonsky',
    thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=200&auto=format&fit=crop&q=80',
    duration: '5:27',
    channelTitle: 'Steve Jablonsky',
  },
  {
    videoId: 'L_hFw_4Wg9U',
    title: 'Lupin Season 2 - Theme',
    artist: 'Mathieu Lamboley',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&auto=format&fit=crop&q=80',
    duration: '2:50',
    channelTitle: 'Mathieu Lamboley',
  },
  {
    videoId: 'b_kWu7N8_5M',
    title: 'Avatar: The Way of Water - Nothing Is Lost',
    artist: 'The Weeknd',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    duration: '4:27',
    channelTitle: 'The Weeknd',
  },
];

const SEED_YOU_MIGHT_LIKE: { song: Song; genre: string }[] = [
  {
    genre: 'Fantasy',
    song: {
      videoId: 'c_lGZvd_Z00',
      title: 'The Flash (2023) - Run',
      artist: 'Benjamin Wallfisch',
      thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      duration: '3:10',
      channelTitle: 'WaterTower Music',
    },
  },
  {
    genre: 'Mistery',
    song: {
      videoId: 'YQHsXMglC9A',
      title: 'Manifest - Series Theme',
      artist: 'Danny Lux',
      thumbnail: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&auto=format&fit=crop&q=80',
      duration: '2:45',
      channelTitle: 'Danny Lux',
    },
  },
  {
    genre: 'Animation',
    song: {
      videoId: 'hfd85uE-e64',
      title: 'Elemental - Steal The Show',
      artist: 'Lauv',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      duration: '3:11',
      channelTitle: 'DisneyMusicVEVO',
    },
  },
  {
    genre: 'Sci-fi',
    song: {
      videoId: '1V_xRb0x9aw',
      title: 'Interstellar - Cornfield Chase',
      artist: 'Hans Zimmer',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      duration: '2:06',
      channelTitle: 'WaterTower Music',
    },
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onOpenAddToPlaylist,
  onNavigateTab,
  onTriggerSearch,
  activeCategory,
}) => {
  const { history, searchHistory } = useAuth();

  // Instant seed data so it NEVER looks empty
  const [featuredPlaylist, setFeaturedPlaylist] = useState<Playlist>(SEED_HERO_PLAYLIST);
  const [youMightLike, setYouMightLike] = useState(SEED_YOU_MIGHT_LIKE);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>(SEED_TRENDING);
  const [activeSearchFilter, setActiveSearchFilter] = useState<string | null>(null);

  // Normalize previous searches to prevent duplicate typo variants
  const safeSearchHistory = Array.isArray(searchHistory) ? searchHistory : [];
  const normalizedSearches = safeSearchHistory
    .map((s) => (typeof s === 'string' ? normalizeQueryTypo(s).toLowerCase().trim() : ''))
    .filter(Boolean);
  const uniqueSearches = Array.from(new Set(normalizedSearches)).slice(0, 6);

  useEffect(() => {
    loadDashboardData();
  }, [activeCategory, safeSearchHistory.length, activeSearchFilter]);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch trending songs
      const trend = await api.getTrending('IN', 6).catch(() => []);
      if (trend && trend.length > 0) {
        setTrendingSongs(trend);
      }

      // 2. Multi-Search Personalization when in "All Tracks"
      if (activeCategory === 'all' && uniqueSearches.length > 0) {
        // If a specific search pill is clicked, filter by that search, otherwise blend ALL searches
        const targetSearches = activeSearchFilter ? [activeSearchFilter] : uniqueSearches;

        const isJukebox = (s: Song) => {
          const t = (s.title || '').toLowerCase();
          const d = s.duration || '';
          const hasKeyword = /\b(jukebox|all songs|full album|full songs|audio jukebox|video jukebox|movie songs jukebox|complete album|mega mix|discography|all video songs)\b/i.test(t);
          const isLong = d.includes(':') && (d.split(':').length > 2 || parseInt(d.split(':')[0], 10) >= 8);
          return hasKeyword || isLong;
        };

        const searchPromises = targetSearches.map(async (term) => {
          try {
            // First attempt curated AI recommendations for top hit tracks
            const rec = await api.recommendMusic(term, 'guest').catch(() => null);
            if (rec && rec.songs && rec.songs.length > 0) {
              const nonJuke = rec.songs.filter((song) => !isJukebox(song));
              if (nonJuke.length > 0) return nonJuke;
            }
            // Fallback to direct search
            const songs = await api.searchMusic(term, 8).catch(() => []);
            return songs.filter((song) => !isJukebox(song));
          } catch {
            return [];
          }
        });

        const resultsPerSearch = await Promise.all(searchPromises);

        const seenIds = new Set<string>();
        const blendedList: { genre: string; song: Song }[] = [];

        // Interleave songs across ALL previous searches so each search is represented!
        const maxLen = Math.max(...resultsPerSearch.map((r) => r.length), 0);
        for (let i = 0; i < maxLen; i++) {
          for (let qIdx = 0; qIdx < targetSearches.length; qIdx++) {
            const song = resultsPerSearch[qIdx][i];
            if (song && !seenIds.has(song.videoId)) {
              seenIds.add(song.videoId);
              const tag = targetSearches[qIdx].length > 14
                ? targetSearches[qIdx].slice(0, 12) + '..'
                : targetSearches[qIdx];
              blendedList.push({
                genre: tag.charAt(0).toUpperCase() + tag.slice(1),
                song,
              });
            }
          }
        }

        if (blendedList.length > 0) {
          // Display up to 12 songs (2 to 3 rows of cards!)
          setYouMightLike(blendedList.slice(0, 12));

          const primarySearch = targetSearches[0];
          setFeaturedPlaylist({
            _id: `search_mix_${Date.now()}`,
            title: `Your Mix: ${targetSearches.slice(0, 3).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' • ')}`,
            description: `Curated soundtrack blending your musical searches: ${targetSearches.join(', ')}.`,
            mood: 'Personalized',
            coverImage: blendedList[0]?.song?.thumbnail || SEED_HERO_PLAYLIST.coverImage,
            songs: blendedList.map((item) => item.song),
            isAiGenerated: true,
          });
          return;
        }
      }

      // Default category handling
      let query = 'Spider-Man Across the Spider-Verse soundtrack songs';
      if (activeCategory === 'gym') query = 'high energy gym workout music songs';
      else if (activeCategory === 'lofi') query = 'lofi chill study beats music';
      else if (activeCategory === 'bollywood') query = 'romantic Bollywood acoustic songs';
      else if (activeCategory === 'pop') query = 'top pop hits music songs';
      else if (activeCategory === 'acoustic') query = 'peaceful acoustic unplugged music';
      else if (activeCategory === 'trending') query = 'top trending global songs 2026';

      const moodData = await api.recommendMusic(query, 'guest');

      if (moodData && moodData.songs && moodData.songs.length >= 4) {
        const badges = ['Fantasy', 'Mistery', 'Animation', 'Sci-fi', 'Bollywood', 'Lo-Fi', 'Pop', 'Acoustic'];
        // Show up to 12 songs instead of just 4!
        setYouMightLike(
          moodData.songs.slice(0, 12).map((s, idx) => ({
            genre: badges[idx % badges.length],
            song: s,
          }))
        );

        if (moodData.generatedPlaylist) {
          setFeaturedPlaylist({
            _id: `ai_hero_${Date.now()}`,
            title: moodData.generatedPlaylist.title,
            description: moodData.generatedPlaylist.description,
            mood: moodData.generatedPlaylist.mood,
            coverImage: moodData.generatedPlaylist.coverImage,
            songs: moodData.songs,
            isAiGenerated: true,
          });
        }
      }
    } catch (err) {
      console.warn('Dashboard live refresh fallback retained:', err);
    }
  };

  const currentHistory = history.length > 0 ? history : SEED_HISTORY;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 overflow-y-auto no-scrollbar pb-36 md:pb-24">
      {/* 1. Left Sub-Widgets (Trending Tracks & Continue Listening) */}
      <LeftSidebarWidgets
        trendingSongs={trendingSongs}
        historySongs={currentHistory}
        onOpenAddToPlaylist={onOpenAddToPlaylist}
      />

      {/* 2. Main Stage: Hero Card + "You might like" grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 order-1 lg:order-2">
        {/* Top: Large Hero Card matching reference */}
        <HeroFeatured
          playlist={featuredPlaylist}
          onExplore={() => onNavigateTab('discover')}
        />

        {/* Bottom: "You might like" Section matching reference */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {activeCategory === 'all' && uniqueSearches.length > 0
                  ? activeSearchFilter
                    ? `Recommended • Based on "${activeSearchFilter}"`
                    : `Recommended for you (${youMightLike.length} songs from your searches)`
                  : `You might like (${youMightLike.length})`}
              </h3>
              {activeCategory === 'all' && uniqueSearches.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-white/80 border border-white/10">
                  <Sparkles className="w-2.5 h-2.5 text-brand-purple" />
                  Multi-Search Blended
                </span>
              )}
            </div>

            <button
              onClick={() => onNavigateTab('discover')}
              className="text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Quick previous searches filter pills */}
          {uniqueSearches.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] text-white/40 shrink-0 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                Your searches:
              </span>
              <button
                onClick={() => setActiveSearchFilter(null)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                  activeSearchFilter === null
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white'
                }`}
              >
                All Searches Mixed
              </button>
              {uniqueSearches.map((term, idx) => {
                const isSelected = activeSearchFilter === term;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveSearchFilter(isSelected ? null : term)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grid of 8 to 12 Cards (2 to 3 rows of recommendations) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5">
            {youMightLike.map((item) => (
              <SongCard
                key={item.song.videoId}
                song={item.song}
                onAddToPlaylist={onOpenAddToPlaylist}
                playlistContext={youMightLike.map((i) => i.song)}
                genreBadge={item.genre}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
