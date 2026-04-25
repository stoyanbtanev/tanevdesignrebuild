import { useEffect } from 'react';

/**
 * Attach an HLS source to a <video> element.
 *
 * `hls.js` is loaded via dynamic import so it ships in its own async chunk
 * and stays out of the first-paint budget. Falls back to native playback
 * (Safari, iOS) when hls.js is not supported.
 */
export function useHls(
  videoRef: React.RefObject<HTMLVideoElement>,
  src: string,
  enabled: boolean = true,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    let cancelled = false;
    let hls: { destroy: () => void } | null = null;

    (async () => {
      const { default: Hls } = await import('hls.js');
      if (cancelled || !videoRef.current) return;
      const node = videoRef.current;

      if (Hls.isSupported()) {
        const instance = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
        });
        instance.loadSource(src);
        instance.attachMedia(node);
        hls = instance;
      } else if (node.canPlayType('application/vnd.apple.mpegurl')) {
        node.src = src;
      }

      const playPromise = node.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          /* autoplay was blocked; the video stays paused at frame 1 */
        });
      }
    })();

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [videoRef, src, enabled]);
}
