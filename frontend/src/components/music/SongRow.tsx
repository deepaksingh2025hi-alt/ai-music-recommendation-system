import React from 'react';
import { Play, Pause, Heart, Plus, Trash2, ListPlus } from 'lucide-react';
import { Song } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';

interface SongRowProps {
  song: Song;
  index: number;
  onAddToPlaylist?: (song: Song) => void;
  onRemoveFromPlaylist?: (videoId: string) => void;
  playlistContext?: Song[];
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  playlistContext,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = usePlayer();
  const { isLiked, toggleLike } = useAuth();

  const isCurrent = currentSong?.videoId === song.videoId;
  const isPlayingThis = isCurrent && isPlaying;
  const liked = isLiked(song.videoId);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className={`group flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
        isCurrent
          ? 'bg-brand-purple/15 border-brand-purple/40 text-white shadow-sm'
          : 'border-transparent hover:bg-white/[0.04] text-slate-300'
      }`}
    >
      {/* Left: Index & Thumbnail & Title */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-5 text-center text-xs font-mono text-slate-500 group-hover:hidden">
          {isPlayingThis ? (
            <span className="flex items-center justify-center gap-0.5">
              <span className="w-0.5 h-3 bg-brand-purple animate-bounce" />
              <span className="w-0.5 h-2 bg-brand-cyan animate-bounce [animation-delay:-0.2s]" />
            </span>
          ) : (
            index + 1
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          className="w-5 hidden group-hover:flex items-center justify-center text-white"
        >
          {isPlayingThis ? <Pause className="w-4 h-4 fill-current text-brand-purple" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <img
          src={song.thumbnail}
          alt={song.title}
          className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
        />

        <div className="min-w-0 flex-1 pr-4">
          <p
            className={`text-xs font-semibold truncate ${
              isCurrent ? 'text-brand-purple font-bold' : 'text-slate-100 group-hover:text-white'
            }`}
          >
            {song.title}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{song.artist}</p>
        </div>
      </div>

      {/* Right: Duration & Actions */}
      <div className="flex items-center gap-3">
        {/* Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song);
          }}
          className={`p-1.5 rounded-lg transition-transform active:scale-90 ${
            liked ? 'text-brand-pink' : 'text-slate-500 hover:text-white hover:bg-white/[0.05]'
          }`}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Add to Queue */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(song);
          }}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"
          title="Add to Queue"
        >
          <ListPlus className="w-3.5 h-3.5" />
        </button>

        {/* Add to Playlist */}
        {onAddToPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToPlaylist(song);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"
            title="Add to Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Remove from Playlist (if inside a user playlist) */}
        {onRemoveFromPlaylist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFromPlaylist(song.videoId);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
            title="Remove from Playlist"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        <span className="text-xs text-slate-400 font-mono w-10 text-right">
          {song.duration || '3:30'}
        </span>
      </div>
    </div>
  );
};

