import React, { useEffect, useState } from 'react';

export const PointerGlow: React.FC = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden overflow-hidden md:block"
    >
      <div
        className="absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
          background:
            'radial-gradient(circle, rgba(35,181,200,0.48) 0%, rgba(178,232,239,0.28) 55%, transparent 100%)',
        }}
      />
    </div>
  );
};
