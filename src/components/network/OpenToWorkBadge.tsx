import React from 'react';

interface OpenToWorkBadgeProps {
  avatarUrl?: string;
  name: string;
  isOpenToWork?: boolean;
  isHiring?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const OpenToWorkBadge: React.FC<OpenToWorkBadgeProps> = ({
  avatarUrl,
  name,
  isOpenToWork = false,
  isHiring = false,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: {
      container: 'w-10 h-10',
      badgeText: 'text-[8px]',
      badgePadding: 'px-1.5 py-0.5',
      badgeOffset: '-bottom-2',
      dotSize: 'w-2.5 h-2.5',
    },
    md: {
      container: 'w-14 h-14',
      badgeText: 'text-[9px]',
      badgePadding: 'px-2 py-0.5',
      badgeOffset: '-bottom-2',
      dotSize: 'w-3 h-3',
    },
    lg: {
      container: 'w-20 h-20',
      badgeText: 'text-[10px]',
      badgePadding: 'px-2.5 py-0.5',
      badgeOffset: '-bottom-2.5',
      dotSize: 'w-3.5 h-3.5',
    },
    xl: {
      container: 'w-24 h-24 sm:w-28 sm:h-28',
      badgeText: 'text-xs font-bold',
      badgePadding: 'px-3 py-1',
      badgeOffset: '-bottom-3',
      dotSize: 'w-4 h-4',
    },
  };

  const currentSize = sizeMap[size];
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=0284c7,16a34a,d97706,4f46e5`;

  let badgeLabel = '';
  let badgeStyle = '';
  let beaconColor = '';

  if (isOpenToWork) {
    badgeLabel = '🎯 Təkliflərə Açıq';
    badgeStyle = 'bg-emerald-600 text-white shadow-xs border border-emerald-500';
    beaconColor = 'bg-emerald-500 ring-2 ring-white';
  } else if (isHiring) {
    badgeLabel = '📢 Kadr Axtarırıq';
    badgeStyle = 'bg-indigo-600 text-white shadow-xs border border-indigo-500';
    beaconColor = 'bg-indigo-500 ring-2 ring-white';
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Avatar Box with crisp border */}
      <div
        className={`relative rounded-2xl overflow-hidden ${currentSize.container} border-2 ${
          isOpenToWork
            ? 'border-emerald-500 shadow-xs'
            : isHiring
            ? 'border-indigo-500 shadow-xs'
            : 'border-slate-200'
        } bg-slate-100 transition-all`}
      >
        <img
          src={avatarUrl || defaultAvatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultAvatar;
          }}
        />

        {/* Status Dot */}
        {(isOpenToWork || isHiring) && (
          <span
            className={`absolute top-1.5 right-1.5 ${currentSize.dotSize} rounded-full ${beaconColor}`}
          />
        )}
      </div>

      {/* Azerbaijani Status Label Pill */}
      {(isOpenToWork || isHiring) && (
        <span
          className={`absolute ${currentSize.badgeOffset} left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full font-bold tracking-tight ${currentSize.badgeText} ${currentSize.badgePadding} ${badgeStyle} select-none pointer-events-none z-10`}
        >
          {badgeLabel}
        </span>
      )}
    </div>
  );
};
