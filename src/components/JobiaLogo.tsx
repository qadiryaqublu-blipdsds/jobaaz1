import React from 'react';

export interface JobiaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  onClick?: () => void;
  clickable?: boolean;
  withSubtitle?: boolean;
  subtitle?: string;
  showDotPing?: boolean;
}

export const JobiaLogo: React.FC<JobiaLogoProps> = ({ 
  className = '', 
  size = 'md',
  onClick,
  clickable = true,
  withSubtitle = false,
  subtitle = 'Job Intelligence & Automation',
  showDotPing = false,
}) => {
  const sizeMap = {
    xs: { fontSize: '18px', height: '24px', subSize: 'text-[9px]' },
    sm: { fontSize: '22px', height: '30px', subSize: 'text-[10px]' },
    md: { fontSize: '28px', height: '38px', subSize: 'text-[11px]' },
    lg: { fontSize: '38px', height: '50px', subSize: 'text-xs' },
    xl: { fontSize: '50px', height: '64px', subSize: 'text-sm' },
    '2xl': { fontSize: '66px', height: '84px', subSize: 'text-base' },
  };

  const current = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) return;
    
    if (onClick) {
      onClick();
      return;
    }

    // Default SPA navigation to root if not provided
    if (window.location.pathname !== '/' || window.location.search !== '') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  return (
    <div
      role={clickable ? 'button' : 'img'}
      tabIndex={clickable ? 0 : undefined}
      aria-label="jobia.az - Ana səhifə"
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      className={`group inline-flex flex-col items-center select-none font-black tracking-[-0.04em] transition-transform active:scale-95 ${
        clickable ? 'cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-0.5' : ''
      } ${className}`}
    >
      {/* Logo container with prototype emerald twin-node icon */}
      <div className="inline-flex items-center gap-1.5 logo-floating-badge">
        <svg 
          className="shrink-0 group-hover:scale-105 transition-transform" 
          width={size === 'xs' ? '18' : size === 'sm' ? '22' : size === 'md' ? '26' : size === 'lg' ? '32' : '38'} 
          height={size === 'xs' ? '18' : size === 'sm' ? '22' : size === 'md' ? '26' : size === 'lg' ? '32' : '38'} 
          viewBox="0 0 28 28" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left tall capsule with head circle */}
          <circle cx="9" cy="5.5" r="3" fill="#00a859" />
          <rect x="6" y="11" width="6" height="12" rx="3" fill="#00a859" />
          {/* Right interconnected lower capsule with head circle */}
          <circle cx="19" cy="8.5" r="3" fill="#00a859" />
          <path d="M16 14C16 12.3431 17.3431 11 19 11C20.6569 11 22 12.3431 22 14V20C22 21.6569 20.6569 23 19 23C17.3431 23 16 21.6569 16 20V14Z" fill="#00a859" />
        </svg>

        <div 
          className="inline-flex items-center font-bold tracking-tight text-[#062319]"
          style={{ 
            fontFamily: "'Onest', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: current.fontSize,
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          <span className="text-[#062319]">jobia</span>
        </div>
      </div>

      {/* Subtitle if requested: Job Intelligence & Automation */}
      {withSubtitle && (
        <span className={`mt-1 font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors ${current.subSize}`}>
          {subtitle}
        </span>
      )}

      {/* Hidden text for screen readers and SEO */}
      <span className="sr-only">jobia.az - Job Intelligence &amp; Automation</span>
    </div>
  );
};

// Also export as HireMeLogo for full backwards compatibility
export const HireMeLogo = JobiaLogo;

export default JobiaLogo;
