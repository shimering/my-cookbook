import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<void>;
  release: () => Promise<void>;
}

/**
 * React hook to keep the screen awake while the cook is viewing a recipe.
 */
export function useWakeLock(autoRequest: boolean = true): UseWakeLockReturn {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [isActive, setIsActive] = useState<boolean>(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;

    try {
      if (sentinelRef.current && !sentinelRef.current.released) {
        return;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        setIsActive(false);
      });
    } catch (err) {
      console.info('Wake lock request denied or not active:', err);
      setIsActive(false);
    }
  }, []);

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      await sentinelRef.current.release();
      sentinelRef.current = null;
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    let released = false;

    if (autoRequest && isSupported) {
      navigator.wakeLock.request('screen').then(
        (sentinel) => {
          if (released) {
            void sentinel.release();
            return;
          }
          sentinelRef.current = sentinel;
          setIsActive(true);
          sentinel.addEventListener('release', () => {
            if (!released) setIsActive(false);
          });
        },
        (err) => {
          console.info('Wake lock request denied or not active:', err);
          if (!released) setIsActive(false);
        }
      );
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRequest && isSupported) {
        void request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      void release();
    };
  }, [autoRequest, isSupported, request, release]);

  return {
    isSupported,
    isActive,
    request,
    release,
  };
}
