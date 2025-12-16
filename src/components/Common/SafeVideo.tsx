import React, { useState, useEffect, useRef } from 'react';
import { getProxyUrl } from '../../utils/urlUtils';
import { Loader2, AlertCircle } from 'lucide-react';
import { resourceQueue } from '../../utils/resourceQueue';

interface SafeVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src?: string | null;
    poster?: string;
    proxyFallback?: boolean;
    lazyLoad?: boolean;
}

export const SafeVideo: React.FC<SafeVideoProps> = ({
    src,
    poster,
    proxyFallback = true,
    lazyLoad = true,
    className,
    autoPlay,
    ...props
}) => {
    const [videoSrc, setVideoSrc] = useState<string | undefined>(undefined);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(!lazyLoad);
    const [isLoading, setIsLoading] = useState(false); // Only true when trying to load
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for Lazy Loading
    useEffect(() => {
        if (!lazyLoad) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px', threshold: 0.01 } // Load when close to visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [lazyLoad]);

    useEffect(() => {
        if (!isVisible) {
            setVideoSrc(undefined);
            setIsLoading(false);
            return;
        }

        if (!src) return;

        setHasError(false);
        setIsLoading(true);

        // Queue the load via Global Resource Queue with DEBOUNCE
        let cancelQueue: (() => void) | undefined;
        let debounceTimer: NodeJS.Timeout | undefined;

        const loadTask = () => {
            setVideoSrc(src);
        };

        // Wait 100ms before queueing
        debounceTimer = setTimeout(() => {
            cancelQueue = resourceQueue.enqueue(loadTask);
        }, 100);

        return () => {
            clearTimeout(debounceTimer);
            if (cancelQueue) cancelQueue();
            // If we unmount/hide, we don't necessarily release() here because release() happens on load/error events.
            // But if the source changes before loading finished, we rely on the next render (and new enqueue) 
            // OR if it's removed, React unmounts the video element cancelling the network request (usually).
        };
    }, [isVisible, src]);

    const handleError = () => {
        if (hasError) {
            resourceQueue.release();
            return;
        } // Already tried fallback

        // If we are already using proxy, we failed.
        if (videoSrc && videoSrc.includes('/assets?url=')) {
            console.error(`[SafeVideo] Proxy failed for: ${src}`);
            setIsLoading(false); // Stop loading spinner on failure
            resourceQueue.release();
            return;
        }

        if (proxyFallback && src && !src.startsWith('data:') && !src.startsWith('blob:')) {
            // Try via proxy
            const proxyUrl = getProxyUrl(src);
            console.log(`[SafeVideo] Retry via proxy: ${proxyUrl}`);
            setVideoSrc(proxyUrl);
            setHasError(true);
            setIsLoading(true);
            // DO NOT RELEASE here, we are retrying
        } else {
            console.error(`[SafeVideo] Failed to load: ${src}`);
            setIsLoading(false);
            resourceQueue.release();
        }
    };

    // Release queue when we have enough data to play, or at least metadata
    const handleLoadedData = () => {
        setIsLoading(false);
        resourceQueue.release();
    };

    const handleWaiting = () => setIsLoading(true);

    // Fallback release if loadeddata doesn't fire but it starts playing (cached)
    const handlePlaying = () => {
        setIsLoading(false);
        resourceQueue.release();
    };

    return (
        <div ref={containerRef} className={`relative overflow-hidden bg-slate-900 ${className}`}>

            {/* LOADING STATE - Unified Overlay */}
            {/* Shows when: 1. Loading (buffering/fetching) OR 2. Not Visible yet (and no poster to show) */}
            {(isLoading || (!isVisible && !poster)) && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    {/* Background: If we have a poster, we want it transparent-ish. If no poster, opaque skeleton. */}
                    {!poster ? (
                        <div className="absolute inset-0 bg-slate-800">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />
                    )}

                    {/* Spinner */}
                    <div className="relative z-30 p-3 bg-slate-900/80 rounded-full shadow-lg border border-white/10 backdrop-blur-sm">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                </div>
            )}

            {isVisible && videoSrc ? (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={poster}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading && !poster ? 'opacity-0' : 'opacity-100'}`}
                    onError={handleError}
                    onLoadedData={handleLoadedData}
                    onWaiting={handleWaiting}
                    onPlaying={handlePlaying}
                    onCanPlay={handleLoadedData}
                    autoPlay={autoPlay}
                    preload="metadata" // Validate: lighter load
                    playsInline
                    loop
                    muted
                    {...props}
                />
            ) : (
                /* Static Poster Placeholder (when not visible yet or src failed/empty) */
                poster && (
                    <img
                        src={poster}
                        className="w-full h-full object-cover opacity-60 blur-sm scale-105 transition-transform duration-700"
                        alt="Video placeholder"
                    />
                )
            )}
        </div>
    );
};
