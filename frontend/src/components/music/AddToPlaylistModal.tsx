import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { Song } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface AddToPlaylistModalProps {
  song: Song | null;
  onClose: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ song, onClose }) => {
  const { playlists, refreshPlaylists } = useAuth();
  const { showToast } = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!song) return null;

  const handleAddToExisting = async (playlistId: string, playlistTitle: string) => {
    try {
      setSubmitting(true);
      await api.addSongToPlaylist(playlistId, song);
      await refreshPlaylists();
      showToast(`Added to "${playlistTitle}"`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to add song to playlist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const created = await api.createPlaylist({
        title: newTitle.trim(),
        description: `Created with track ${song.title}`,
        songs: [song],
        coverImage: song.thumbnail,
        userId: 'guest',
      });
      await refreshPlaylists();
      showToast(`Created playlist "${created.title}" and added song!`, 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to create playlist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark-950/70 backdrop-blur-md"
        />

        {/* Modal card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-dark-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <ListMusic className="w-5 h-5 text-brand-purple" />
              <div>
                <h3 className="text-sm font-bold text-white">Add to Playlist</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{song.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Create New */}
          <div className="mt-4 pb-4 border-b border-white/[0.06]">
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-semibold text-purple-300 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Playlist with this track</span>
              </button>
            ) : (
              <form onSubmit={handleCreateAndAdd} className="space-y-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New playlist name..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-dark-850 border border-brand-purple/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newTitle.trim()}
                    className="px-4 py-1.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Create & Add
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Existing Playlists list */}
          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select an existing playlist
            </p>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {playlists.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No playlists created yet.</p>
              ) : (
                playlists.map((pl) => {
                  const alreadyIn = pl.songs?.some((s) => s.videoId === song.videoId);
                  return (
                    <button
                      key={pl._id}
                      disabled={alreadyIn || submitting}
                      onClick={() => handleAddToExisting(pl._id, pl.title)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                        alreadyIn
                          ? 'bg-white/[0.02] border-white/[0.04] opacity-50 cursor-not-allowed text-slate-500'
                          : 'bg-dark-850/60 hover:bg-brand-purple/15 border-white/[0.06] hover:border-brand-purple/40 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{pl.title}</p>
                        <p className="text-[10px] text-slate-400">{pl.songs?.length || 0} songs</p>
                      </div>

                      {alreadyIn ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" /> Added
                        </span>
                      ) : (
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-brand-purple" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

