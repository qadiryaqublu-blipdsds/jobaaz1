import React from 'react';
import { Language } from '../i18n/types';

interface FlagIconProps {
  language: Language;
  className?: string;
}

export const AzerbaijanFlag: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 16"
    className={`rounded-xs overflow-hidden shadow-2xs shrink-0 border border-slate-200/80 ${className}`}
    aria-label="Azərbaycan bayrağı"
  >
    {/* Blue stripe */}
    <rect x="0" y="0" width="24" height="5.33" fill="#0092BC" />
    {/* Red stripe */}
    <rect x="0" y="5.33" width="24" height="5.34" fill="#ED2939" />
    {/* Green stripe */}
    <rect x="0" y="10.67" width="24" height="5.33" fill="#3F9C35" />

    {/* White Crescent */}
    <path
      d="M11.5 8a2.5 2.5 0 1 0 0-3.5 2.8 2.8 0 1 1 0 3.5z"
      fill="#FFFFFF"
      transform="translate(-0.5, 0)"
    />

    {/* 8-pointed Star */}
    <g transform="translate(13.2, 8) scale(0.9)">
      <polygon
        points="0,-2.3 0.7,-0.7 2.3,0 0.7,0.7 0,2.3 -0.7,0.7 -2.3,0 -0.7,-0.7"
        fill="#FFFFFF"
      />
      <polygon
        points="0,-2.3 0.7,-0.7 2.3,0 0.7,0.7 0,2.3 -0.7,0.7 -2.3,0 -0.7,-0.7"
        fill="#FFFFFF"
        transform="rotate(45)"
      />
    </g>
  </svg>
);

export const UKFlag: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 16"
    className={`rounded-xs overflow-hidden shadow-2xs shrink-0 border border-slate-200/80 ${className}`}
    aria-label="UK flag"
  >
    <clipPath id="uk-flag-clip">
      <rect width="24" height="16" />
    </clipPath>
    <g clipPath="url(#uk-flag-clip)">
      {/* Navy background */}
      <rect width="24" height="16" fill="#012169" />
      {/* White diagonals */}
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#FFFFFF" strokeWidth="3" />
      {/* Red diagonals */}
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
      {/* White cross */}
      <path d="M12 0 v16 M0 8 h24" stroke="#FFFFFF" strokeWidth="5.5" />
      {/* Red cross */}
      <path d="M12 0 v16 M0 8 h24" stroke="#C8102E" strokeWidth="3.2" />
    </g>
  </svg>
);

export const RussiaFlag: React.FC<{ className?: string }> = ({ className = 'w-5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 16"
    className={`rounded-xs overflow-hidden shadow-2xs shrink-0 border border-slate-200/80 ${className}`}
    aria-label="Russian flag"
  >
    {/* White top stripe */}
    <rect x="0" y="0" width="24" height="5.33" fill="#FFFFFF" />
    {/* Blue middle stripe */}
    <rect x="0" y="5.33" width="24" height="5.34" fill="#0039A6" />
    {/* Red bottom stripe */}
    <rect x="0" y="10.67" width="24" height="5.33" fill="#D52B1E" />
  </svg>
);

export const FlagIcon: React.FC<FlagIconProps> = ({ language, className }) => {
  switch (language) {
    case 'az':
      return <AzerbaijanFlag className={className} />;
    case 'en':
      return <UKFlag className={className} />;
    case 'ru':
      return <RussiaFlag className={className} />;
    default:
      return <AzerbaijanFlag className={className} />;
  }
};
