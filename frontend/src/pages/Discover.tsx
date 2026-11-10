import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Play,
  BookmarkPlus,
  Zap,
  Activity,
  Globe2,
  Compass,
  ListMusic,
  Check,
} from 'lucide-react';
import { Song, Playlist, RecommendResponse } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { SongCard } from '../components/music/SongCard';
import { SkeletonCard } from '../components/common/SkeletonCard';

interface DiscoverProps {
  onOpenAddToPlaylist: (song: Song) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

const EXAMPLE_PROMPTS = [
  'I want peaceful songs for studying',
  'Suggest relaxing Hindi songs',
  'I need energetic songs for the gym',
  'Play sad English songs for heartbreak',
  'Suggest romantic Bollywood love songs',
  'Give me motivational late-night coding music',
  'Play nostalgic 2000s indie pop',
  'Suggest Rajasthani folk fusion acoustic',
];

export const Discover: React.FC<DiscoverProps> = ({ onOpenAddToPlaylist, onSelectPlaylist }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResponse | null>(null);
  const [savedPlaylistId, setSavedPlaylistId] = useState<string | null>(null);

  const { refreshPlaylists } = useAuth();
  const { playPlaylist } = usePlayer();
  const { showToast } = useToast();

  const handleSearch = async (userPrompt: string) => {
    const query = userPrompt.trim();
    if (!query) return;

    try {
      setLoading(true);
      setSavedPlaylistId(null);
      const res = await api.recommendMusic(query, 'guest');
      setResult(res);
    } catch (err: any) {
      showToast('Error generating AI recommendation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (result && result.songs && result.songs.length > 0) {
      playPlaylist(result.songs, 0);
    }
  };

  const handleSavePlaylist = async () => {
    if (!result || !result.generatedPlaylist) return;
    try {
      const created = await api.createPlaylist({
        title: result.generatedPlaylist.title,
        description: result.generatedPlaylist.description,
        mood: result.generatedPlaylist.mood,
        coverImage: result.generatedPlaylist.coverImage,
        songs: result.songs,
        isAiGenerated: true,
        userId: 'guest',
      });
      await refreshPlaylists();
      setSavedPlaylistId(created._id);
      showToast(`Saved "${created.title}" to your playlists!`, 'success');
    } catch (e) {
      showToast('Failed to save playlist', 'error');
    }
  };

  return (
    <div className="pb-36 md:pb-28 px-1 sm:px-6 pt-3 sm:pt-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl overflow-hidden p-5 sm:p-8 border border-white/[0.08] bg-gradient-to-r from-dark-900 via-dark-850 to-brand-violet/25 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Music Engine</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Describe Any Music You Feel
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our multi-modal AI interprets mood, genre, energy, and lyrical themes to instantly curate real full-length YouTube tracks.
          </p>

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(prompt);
            }}
            className="pt-3 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. I want peaceful Hindi songs, energetic gym music, 2000s rock..."
                className="w-full pl-12 pr-4 py-3.5 bg-dark-950/80 border border-white/[0.1] focus:border-brand-purple/70 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-indigo-500 text-white font-bold text-sm shadow-neon-purple active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Curating...' : 'Generate'}</span>
            </button>
          </form>

          {/* Prompt pills */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 mr-2">Try prompts:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1.5">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    handleSearch(p);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-brand-purple/20 hover:text-purple-200 border border-white/[0.06] text-[11px] text-slate-400 transition-colors"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6">
          <div className="h-44 rounded-3xl glass-card animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis & Result Presentation */}
      {!loading && result && (
        <div className="space-y-8">
          {/* AI Intelligence Breakdown Bar */}
          <div className="glass-panel p-5 rounded-3xl border border-brand-purple/30 shadow-neon-purple/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mood:</span>
                <span className="px-2.5 py-1 rounded-xl bg-brand-purple/20 text-brand-purple font-semibold text-xs border border-brand-purple/30">
                  {result.analysis.mood}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Genre:</span>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                  {result.analysis.genre}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Energy:</span>
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30 capitalize">
                  {result.analysis.energy}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tempo:</span>
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-semibold text-xs border border-cyan-500/30 capitalize">
                  {result.analysis.tempo}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Languages:</span>
                <span className="text-xs text-slate-300 font-medium">
                  {result.analysis.language.join(', ')}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Engine:</span>
              <span className="font-bold text-slate-200 uppercase">
                {result.analysis.provider === 'gemini' ? 'Gemini 1.5 Flash' : 'NLP Heuristic'}
              </span>
            </div>
          </div>

          {/* Generated Playlist Header Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={result.generatedPlaylist.coverImage}
                alt={result.generatedPlaylist.title}
                className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-xl border border-white/10 shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                  Generated AI Playlist
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {result.generatedPlaylist.title}
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                  {result.generatedPlaylist.description}
                </p>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  {result.songs.length} real YouTube tracks retrieved
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-purple hover:from-brand-purple hover:to-indigo-500 text-white font-bold text-xs shadow-neon-purple active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play Entire Playlist</span>
              </button>

              <button
                onClick={handleSavePlaylist}
                disabled={Boolean(savedPlaylistId)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-all ${
                  savedPlaylistId
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-white'
                }`}
              >
                {savedPlaylistId ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save Playlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div>
            <h3 className="text-base font-bold text-white mb-4">Recommended Songs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {result.songs.map((song) => (
                <SongCard
                  key={song.videoId}
                  song={song}
                  onAddToPlaylist={onOpenAddToPlaylist}
                  playlistContext={result.songs}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

