import React from 'react';
import { JobiaLogo } from '../JobiaLogo';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface SectionBottomLogoProps {
  className?: string;
  tagline?: string;
  size?: 'xs' | 'sm' | 'md';
  showSubtitle?: boolean;
}

export const SectionBottomLogo: React.FC<SectionBottomLogoProps> = ({
  className = '',
  tagline,
  size = 'sm',
  showSubtitle = true,
}) => {
  return (
    <div
      className={`w-full py-4 mt-6 flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors">
        <JobiaLogo
          size={size}
          withSubtitle={showSubtitle}
          subtitle="Job Intelligence & Automation"
          showDotPing={true}
        />
        {tagline && (
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00a859]" />
            <span>{tagline}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SectionBottomLogo;
