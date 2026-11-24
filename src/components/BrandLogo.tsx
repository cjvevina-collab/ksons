import React, { useState } from 'react';
import { STORE_INFO } from '../data/catalog';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-14 w-14',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-[#23B5C8]/45 shadow-sm ${SIZE_CLASSES[size]} ${className}`}
    >
      {!failed ? (
        <img
          src={STORE_INFO.logoPath}
          alt={`${STORE_INFO.brandName} logo`}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full scale-[1.03] object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#EEF9FB] font-display text-lg font-bold text-[#118A9B]">
          K
        </div>
      )}
    </div>
  );
};
