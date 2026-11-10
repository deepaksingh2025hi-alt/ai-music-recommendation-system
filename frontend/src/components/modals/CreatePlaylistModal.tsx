import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ListPlus, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
];

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { refreshPlaylists } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('Chill');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await api.createPlaylist({
        title: title.trim(),
        description: description.trim(),
        mood,
        coverImage,
        songs: [],
        userId: 'guest',
      });
      await refreshPlaylists();
      showToast(`Playlist "${title.trim()}" created!`, 'success');
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      showToast('Failed to create playlist', 'error');
    } finally {
      setLoading(false);
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
          className="absolute inset-0 bg-dark-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-dark-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <ListPlus className="w-5 h-5 text-brand-purple" />
              <div>
                <h3 className="text-sm font-bold text-white">Create New Playlist</h3>
                <p className="text-[11px] text-slate-400">Assemble your custom audio sanctuary</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Playlist Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Drives, Acoustic Bliss"
                autoFocus
                className="w-full px-3.5 py-2.5 bg-dark-850 border border-white/[0.08] focus:border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is the story or feeling of this playlist?"
                className="w-full px-3.5 py-2.5 bg-dark-850 border border-white/[0.08] focus:border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none resize-none"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mood / Vibe
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-850 border border-white/[0.08] focus:border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="Chill">Chill & Mellow</option>
                <option value="Peaceful">Peaceful & Acoustic</option>
                <option value="Energetic">Energetic & Workout</option>
                <option value="Focused">Focused & Study</option>
                <option value="Romantic">Romantic & Intimate</option>
                <option value="Nostalgic">Nostalgic Throwback</option>
                <option value="Euphoric">Euphoric & Dance</option>
              </select>
            </div>

            {/* Cover Art selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cover Art
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COVERS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="cover option"
                    onClick={() => setCoverImage(url)}
                    className={`w-full aspect-square object-cover rounded-xl cursor-pointer border-2 transition-all ${
                      coverImage === url
                        ? 'border-brand-purple scale-105 shadow-md shadow-purple-950/50'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-bold shadow-neon-purple active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? 'Creating...' : 'Create Playlist'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

