import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#E6F6F8] via-[#F2EEFB] to-[#FDF2F8] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="h-7 w-7 text-[#118A9B]" aria-hidden="true" />
        <span className="mt-2 max-w-[160px] text-xs font-medium text-[#334550]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};
