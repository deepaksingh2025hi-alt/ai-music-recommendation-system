import React from 'react';
import { History as HistoryIcon, Play } from 'lucide-react';
import { Song } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { SongRow } from '../components/music/SongRow';
import { EmptyState } from '../components/common/EmptyState';

interface HistoryProps {
  onOpenAddToPlaylist: (song: Song) => void;
  onExplore: () => void;
}

export const History: React.FC<HistoryProps> = ({ onOpenAddToPlaylist, onExplore }) => {
  const { history } = useAuth();
  const { playPlaylist } = usePlayer();

  const handlePlayAll = () => {
    if (history.length > 0) {
      playPlaylist(history, 0);
    }
  };

  return (
    <div className="pb-36 md:pb-28 px-1 sm:px-6 pt-3 sm:pt-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-purple to-indigo-600 flex items-center justify-center text-white shadow-neon-purple/30">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Recently Played
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Your recent listening history and session playback log
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-purple text-white text-xs font-bold shadow-neon-purple active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Replay Session</span>
          </button>
        )}
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <EmptyState
          title="No Listening History"
          description="Songs you play will automatically appear here."
          actionText="Start Listening"
          onAction={onExplore}
          icon={<HistoryIcon className="w-8 h-8" />}
        />
      ) : (
        <div className="glass-card rounded-2xl p-2 border border-white/[0.06] divide-y divide-white/[0.04]">
          {history.map((song, idx) => (
            <SongRow
              key={`${song.videoId}_${idx}`}
              song={song}
              index={idx}
              onAddToPlaylist={onOpenAddToPlaylist}
              playlistContext={history}
            />
          ))}
        </div>
      )}
    </div>
  );
};

