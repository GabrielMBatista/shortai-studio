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
            // We don't set isLoading=true here blindly because video might already be cached or fast.
            // But we can set it if we want "buffering" UI.
            // Let's rely on onWaiting / onCanPlay events for sophisticated UI, 
            // but for now, simplistic error handling is the goal.
        } else if (!isVisible) {
            setVideoSrc(undefined);
        }
    }, [isVisible, src]);

    const handleError = () => {
        if (hasError) return; // Already tried fallback

        // If we are already using proxy, we failed.
        if (videoSrc && videoSrc.includes('/assets?url=')) {
            console.error(`[SafeVideo] Proxy failed for: ${src}`);
            // Maybe show specific UI?
            return;
        }

        if (proxyFallback && src && !src.startsWith('data:') && !src.startsWith('blob:')) {
            // Try via proxy
            const proxyUrl = getProxyUrl(src);
            console.log(`[SafeVideo] Retry via proxy: ${proxyUrl}`);
            setVideoSrc(proxyUrl);
            setHasError(true);
        } else {
            console.error(`[SafeVideo] Failed to load: ${src}`);
        }
    };

    return (
        <div ref={containerRef} className={`relative overflow-hidden bg-black ${className}`}>
            {isVisible && videoSrc ? (
                <video
                    ref={videoRef}
                    src={videoSrc}
                    poster={poster}
                    className="w-full h-full object-cover"
                    onError={handleError}
                    autoPlay={autoPlay}
                    playsInline
                    loop
                    muted
                    {...props}
                />
            ) : (
                // Placeholder when not visible or no src
                poster && (
                    <img
                        src={poster}
                        className="w-full h-full object-cover opacity-50"
                        alt="Video placeholder"
                    />
                )
            )}

            {/* Optional: Add loading/error overlay if needed, but SceneCard handles its own overlays slightly differently. 
                We keep this component focused on the "Safe" part (Proxy path) + Lazy Load.
            */}
        </div>
    );
};
