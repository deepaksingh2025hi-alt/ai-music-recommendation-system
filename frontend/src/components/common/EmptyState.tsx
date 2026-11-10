import React from 'react';
import { Music, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl border border-white/[0.06] my-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-4 shadow-neon-purple/20">
        {icon || <Music className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-violet text-white text-xs font-bold shadow-neon-purple active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

