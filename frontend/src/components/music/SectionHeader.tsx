import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  actionText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  onAction,
  actionText = 'See All',
}) => {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-brand-purple">{icon}</span>}
          <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:text-purple-300 transition-colors py-1 px-2 rounded-lg hover:bg-brand-purple/10"
        >
          <span>{actionText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

