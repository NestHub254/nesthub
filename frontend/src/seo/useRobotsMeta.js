import { useEffect } from 'react';

/** Sets document-level robots meta for private SPA routes (complements hosting headers). */
export function useRobotsMeta(content) {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const previous = meta?.getAttribute('content') ?? null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
    return () => {
      if (previous == null) meta.remove();
      else meta.setAttribute('content', previous);
    };
  }, [content]);
}
