import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Shuffle, Play, ListMusic, Music, FolderPlus } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Song } from '../../types';

export interface QueueDrawerProps {
  onOpenAddToPlaylist?: (song: Song) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ onOpenAddToPlaylist }) => {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentSong,
    playSong,
    removeFromQueue,
    clearQueue,
    toggleShuffle,
    isShuffle,
  } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsQueueOpen(false)}
          className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-24 w-full max-w-md bg-dark-900/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl p-6 flex flex-col pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <ListMusic className="w-5 h-5 text-brand-purple" />
              <div>
                <h3 className="text-sm font-bold text-white">Playing Queue</h3>
                <p className="text-[11px] text-slate-400">{queue.length} tracks in line</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-xl border transition-all ${
                  isShuffle
                    ? 'bg-brand-purple/20 text-brand-cyan border-brand-purple/40'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/[0.06]'
                }`}
                title="Shuffle Queue"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={clearQueue}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-white/[0.06] transition-all"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsQueueOpen(false)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Music className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Queue is empty</p>
                <p className="text-[11px] mt-1">Play any playlist or song to add them here.</p>
              </div>
            ) : (
              queue.map((song, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${song.videoId}_${idx}`}
                    onClick={() => playSong(song)}
                    className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all border ${
                      isCurrent
                        ? 'bg-brand-purple/20 border-brand-purple/50 text-white shadow-sm'
                        : 'border-transparent hover:bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-dark-950">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-dark-950/50 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-brand-purple' : ''}`}>
                          {song.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">{song.duration || '3:30'}</span>
                      {onOpenAddToPlaylist && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAddToPlaylist(song);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white transition-all rounded-lg cursor-pointer"
                          title="Add to playlist"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(idx);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition-all rounded-lg cursor-pointer"
                        title="Remove from queue"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

