import React, { useState } from 'react';
import {
  Play,
  Shuffle,
  Trash2,
  Edit3,
  ArrowLeft,
  Sparkles,
  Music,
  Check,
} from 'lucide-react';
import { Playlist, Song } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { useToast } from '../context/ToastContext';
import { SongRow } from '../components/music/SongRow';
import { EmptyState } from '../components/common/EmptyState';

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onOpenAddToPlaylist: (song: Song) => void;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
  playlist: initialPlaylist,
  onBack,
  onOpenAddToPlaylist,
}) => {
  const [playlist, setPlaylist] = useState<Playlist>(initialPlaylist);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(playlist.title);
  const [editDesc, setEditDesc] = useState(playlist.description || '');

  const { refreshPlaylists } = useAuth();
  const { playPlaylist } = usePlayer();
  const { showToast } = useToast();

  const handlePlayAll = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      playPlaylist(playlist.songs, 0);
    }
  };

  const handleShufflePlay = () => {
    if (playlist.songs && playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      playPlaylist(shuffled, 0);
    }
  };

  const handleRemoveSong = async (videoId: string) => {
    try {
      const updated = await api.removeSongFromPlaylist(playlist._id, videoId);
      setPlaylist(updated);
      await refreshPlaylists();
      showToast('Removed track from playlist', 'info');
    } catch (e) {
      showToast('Failed to remove track', 'error');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) return;
    try {
      await api.deletePlaylist(playlist._id);
      await refreshPlaylists();
      showToast('Playlist deleted', 'info');
      onBack();
    } catch (e) {
      showToast('Failed to delete playlist', 'error');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      const updated = await api.updatePlaylist(playlist._id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      setPlaylist(updated);
      await refreshPlaylists();
      setIsEditing(false);
      showToast('Playlist details updated', 'success');
    } catch (e) {
      showToast('Failed to update playlist', 'error');
    }
  };

  const coverUrl =
    playlist.coverImage ||
    playlist.songs?.[0]?.thumbnail ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="pb-32 px-6 pt-6 max-w-7xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Playlists</span>
      </button>

      {/* Playlist Hero Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-6 pb-6 border-b border-white/[0.08]">
        <img
          src={coverUrl}
          alt={playlist.title}
          className="w-44 h-44 rounded-3xl object-cover shadow-2xl border-2 border-white/10 shrink-0"
        />

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            {playlist.isAiGenerated && (
              <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Generated</span>
              </span>
            )}
            {playlist.mood && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 text-[10px] font-medium">
                {playlist.mood}
              </span>
            )}
          </div>

          {!isEditing ? (
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {playlist.title}
              </h1>
              {playlist.description && (
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {playlist.description}
                </p>
              )}
            </>
          ) : (
            <form onSubmit={handleSaveEdit} className="space-y-2 max-w-md">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-dark-850 border border-brand-purple/50 rounded-xl text-sm text-white focus:outline-none"
              />
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-dark-850 border border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-brand-purple text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Music className="w-4 h-4 text-brand-purple" />
              <span>{playlist.songs?.length || 0} Songs</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={!playlist.songs || playlist.songs.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-purple text-white text-xs font-bold shadow-neon-purple active:scale-95 disabled:opacity-40 transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShufflePlay}
              disabled={!playlist.songs || playlist.songs.length === 0}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold active:scale-95 disabled:opacity-40 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle</span>
            </button>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors"
                title="Rename or Edit Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDeletePlaylist}
              className="p-3 rounded-2xl bg-white/[0.04] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-white/[0.06] transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Tracklist
        </h3>

        {!playlist.songs || playlist.songs.length === 0 ? (
          <EmptyState
            title="This playlist is empty"
            description="Browse music and click the '+' icon on any track to add songs here."
            icon={<Music className="w-8 h-8" />}
          />
        ) : (
          <div className="glass-card rounded-2xl p-2 border border-white/[0.06] divide-y divide-white/[0.04]">
            {playlist.songs.map((song, idx) => (
              <SongRow
                key={`${song.videoId}_${idx}`}
                song={song}
                index={idx}
                onAddToPlaylist={onOpenAddToPlaylist}
                onRemoveFromPlaylist={handleRemoveSong}
                playlistContext={playlist.songs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

