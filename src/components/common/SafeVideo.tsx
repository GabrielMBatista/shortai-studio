import React, { useState, useEffect, useRef } from 'react';
import { getProxyUrl } from '../../utils/urlUtils';
import { Loader2, AlertCircle } from 'lucide-react';

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
            { threshold: 0.1 } // Load when 10% visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [lazyLoad]);

    useEffect(() => {
        if (isVisible && src) {
            setVideoSrc(src);
            setHasError(false);
            setIsLoading(true);
        } else if (!isVisible) {
            setVideoSrc(undefined);
            setIsLoading(false);
        }
    }, [isVisible, src]);

    const handleError = () => {
        if (hasError) return; // Already tried fallback

        // If we are already using proxy, we failed.
        if (videoSrc && videoSrc.includes('/assets?url=')) {
            console.error(`[SafeVideo] Proxy failed for: ${src}`);
            setIsLoading(false); // Stop loading spinner on failure
            return;
        }

        if (proxyFallback && src && !src.startsWith('data:') && !src.startsWith('blob:')) {
            // Try via proxy
            const proxyUrl = getProxyUrl(src);
            console.log(`[SafeVideo] Retry via proxy: ${proxyUrl}`);
            setVideoSrc(proxyUrl);
            setHasError(true);
            setIsLoading(true);
        } else {
            console.error(`[SafeVideo] Failed to load: ${src}`);
            setIsLoading(false);
        }
    };

    const handleLoadedData = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    return (
        <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`}>
            {/* Skeleton Background if no poster and not loaded */}
            {!poster && isLoading && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse z-0" />
            )}

            {isVisible && videoSrc ? (
                <>
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        poster={poster}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading && !poster ? 'opacity-0' : 'opacity-100'}`}
                        onError={handleError}
                        onLoadedData={handleLoadedData}
                        onWaiting={handleWaiting}
                        onPlaying={handlePlaying}
                        onCanPlay={handleLoadedData}
                        autoPlay={autoPlay}
                        playsInline
                        loop
                        muted
                        {...props}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="bg-slate-900/50 backdrop-blur-sm p-3 rounded-full shadow-lg border border-white/10">
                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                // Placeholder when not visible or no src
                poster ? (
                    <img
                        src={poster}
                        className="w-full h-full object-cover opacity-50 blur-sm scale-105"
                        alt="Video placeholder"
                    />
                ) : (
                    <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                    </div>
                )
            )}
        </div>
    );
};
