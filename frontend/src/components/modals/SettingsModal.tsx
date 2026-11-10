import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Key,
  Database,
  Sparkles,
  Youtube,
  Save,
  CheckCircle2,
  AlertCircle,
  Sliders,
  User,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_GENRES = [
  'Lo-Fi',
  'Pop',
  'Bollywood',
  'Indie',
  'Acoustic',
  'Hip-Hop',
  'Rock',
  'EDM',
  'Ambient',
  'Classical',
  'R&B',
  'Punjabi Pop',
];

const AVAILABLE_LANGUAGES = [
  'English',
  'Hindi',
  'Punjabi',
  'Spanish',
  'Korean',
  'Japanese',
  'French',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updatePreferences } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'preferences' | 'apiKeys'>('preferences');
  const [userName, setUserName] = useState(user?.name || 'Guest Explorer');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user?.favouriteGenres || ['Lo-Fi', 'Bollywood']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(user?.preferredLanguages || ['English', 'Hindi']);
  const [energyLevel, setEnergyLevel] = useState(user?.preferences?.energyPreference || 'balanced');

  // API Keys state
  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [savingKeys, setSavingKeys] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      if (user) {
        setUserName(user.name);
        setSelectedGenres(user.favouriteGenres || []);
        setSelectedLanguages(user.preferredLanguages || []);
        setEnergyLevel(user.preferences?.energyPreference || 'balanced');
      }
    }
  }, [isOpen, user]);

  const loadStatus = async () => {
    try {
      const data = await api.getConfigStatus();
      setStatus(data);
    } catch (e) {
      console.warn('Failed to load system config status', e);
    }
  };

  const handleToggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleToggleLanguage = (l: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((item) => item !== l) : [...prev, l]
    );
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      await updatePreferences({
        name: userName.trim(),
        favouriteGenres: selectedGenres,
        preferredLanguages: selectedLanguages,
        preferences: {
          ...user?.preferences,
          energyPreference: energyLevel,
        },
      });
      onClose();
    } catch (err) {
      showToast('Error saving preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingKeys(true);
      await api.updateKeys(
        youtubeKey.trim() || undefined,
        geminiKey.trim() || undefined
      );
      showToast('API Configuration saved successfully', 'success');
      await loadStatus();
      setYoutubeKey('');
      setGeminiKey('');
    } catch (err) {
      showToast('Failed to update API keys', 'error');
    } finally {
      setSavingKeys(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-xl bg-dark-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Platform Settings</h3>
                <p className="text-xs text-slate-400">Personalize recommendations & API configurations</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1 rounded-2xl bg-dark-950/60 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'preferences'
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Taste & Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('apiKeys')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'apiKeys'
                  ? 'bg-brand-purple text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API Keys & Engines</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {activeTab === 'preferences' ? (
              <form onSubmit={handleSavePreferences} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name / Display Alias
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-850 border border-white/[0.08] focus:border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Energy preference */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Default Energy Preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'balanced', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEnergyLevel(level)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                          energyLevel === level
                            ? 'bg-brand-purple/20 border-brand-purple text-brand-purple font-bold'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Genres */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Favorite Genres (Gemini personalizes playlists based on these)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GENRES.map((g) => {
                      const selected = selectedGenres.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleToggleGenre(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selected
                              ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Languages */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Preferred Music Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LANGUAGES.map((l) => {
                      const selected = selectedLanguages.includes(l);
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => handleToggleLanguage(l)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                              : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                          }`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-bold shadow-neon-purple active:scale-95 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingPrefs ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveKeys} className="space-y-5">
                {/* System Status Indicators */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-dark-950/70 border border-white/[0.06] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Gemini AI</span>
                      <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {status?.hasGeminiApiKey ? 'Configured' : 'Smart Heuristic'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-dark-950/70 border border-white/[0.06] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">YouTube API</span>
                      <Youtube className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {status?.hasYoutubeApiKey ? 'Official API v3' : 'Resilient Scraper'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-dark-950/70 border border-white/[0.06] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Database</span>
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">
                      {status?.isMongoConnected ? 'MongoDB Live' : 'Local Fallback'}
                    </span>
                  </div>
                </div>

                {/* YouTube API Key */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    YouTube Data API v3 Key
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Official API key from Google Cloud Console. Leave empty to use resilient live scraper.
                  </p>
                  <input
                    type="password"
                    value={youtubeKey}
                    onChange={(e) => setYoutubeKey(e.target.value)}
                    placeholder={status?.hasYoutubeApiKey ? '•••••••••••••••••••• (configured)' : 'Enter YouTube API key...'}
                    className="w-full px-3.5 py-2.5 bg-dark-850 border border-white/[0.08] focus:border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Gemini API Key */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Google Gemini API Key
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Used for deep natural language sentiment, mood, tempo, and genre extraction.
                  </p>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={status?.hasGeminiApiKey ? '•••••••••••••••••••• (configured)' : 'Enter Gemini API key...'}
                    className="w-full px-3.5 py-2.5 bg-dark-850 border border-white/[0.08] focus:border-brand-purple/50 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingKeys || (!youtubeKey.trim() && !geminiKey.trim())}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-bold shadow-neon-purple active:scale-95 disabled:opacity-40 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingKeys ? 'Updating...' : 'Save API Keys'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

