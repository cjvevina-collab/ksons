import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const MEDIA_PREFIX = 'firestore-media://';
const mediaMemoryCache = new Map<string, string>();
const inflightMediaFetches = new Map<string, Promise<string | null>>();

async function resolveFirestoreMedia(mediaId: string): Promise<string | null> {
  const cached = mediaMemoryCache.get(mediaId);
  if (cached) return cached;

  const existing = inflightMediaFetches.get(mediaId);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const snap = await getDoc(doc(db, 'media', mediaId));
      if (snap.exists()) {
        const data = snap.data() as { dataUrl?: string };
        if (data.dataUrl) {
          mediaMemoryCache.set(mediaId, data.dataUrl);
          return data.dataUrl;
        }
      }
      return null;
    } catch {
      return null;
    } finally {
      inflightMediaFetches.delete(mediaId);
    }
  })();

  inflightMediaFetches.set(mediaId, promise);
  return promise;
}

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
  const isMediaRef = src.startsWith(MEDIA_PREFIX);
  const mediaId = isMediaRef ? src.slice(MEDIA_PREFIX.length) : '';
  const initialResolved = isMediaRef ? mediaMemoryCache.get(mediaId) || '' : src;

  const [resolvedSrc, setResolvedSrc] = useState<string>(initialResolved);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(
    isMediaRef && !initialResolved
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (!src.startsWith(MEDIA_PREFIX)) {
      setResolvedSrc(src);
      setLoadingMedia(false);
      return;
    }

    const id = src.slice(MEDIA_PREFIX.length);
    const cached = mediaMemoryCache.get(id);
    if (cached) {
      setResolvedSrc(cached);
      setLoadingMedia(false);
      return;
    }

    let cancelled = false;
    setLoadingMedia(true);
    void resolveFirestoreMedia(id).then((dataUrl) => {
      if (cancelled) return;
      if (dataUrl) {
        setResolvedSrc(dataUrl);
      } else {
        setHasError(true);
      }
      setLoadingMedia(false);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (loadingMedia) {
    return (
      <div
        className={`animate-pulse bg-gradient-to-br from-[#EAF5F7] to-[#F5FAFB] ${className}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  if (hasError || !resolvedSrc) {
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
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};
