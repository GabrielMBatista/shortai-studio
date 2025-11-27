import React, { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Volume2, Play, Square } from 'lucide-react';

interface AudioPlayerButtonProps {
    audioUrl?: string;
    status: string;
    label?: string;
    icon?: React.ReactNode;
}

const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({ audioUrl, status, label = "Listen", icon }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioUrl) return;

        // Clean up previous audio before creating new one
        if (audioRef.current) {
            audioRef.current.pause();
            const oldSrc = audioRef.current.src;
            audioRef.current.src = ''; // Clear the source first
            audioRef.current.load(); // Reset the audio element
            if (oldSrc.startsWith('blob:')) {
                URL.revokeObjectURL(oldSrc);
            }
        }

        try {
            let resolvedUrl = audioUrl;
            let blobUrl: string | null = null;

            // Convert data URI to Blob URL for better browser compatibility
            if (audioUrl.startsWith('data:audio/')) {
                const [header, base64Data] = audioUrl.split(',');
                if (base64Data) {
                    const mimeMatch = header.match(/data:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'audio/wav';

                    try {
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: mimeType });
                        blobUrl = URL.createObjectURL(blob);
                        resolvedUrl = blobUrl;
                    } catch (err) {
                        console.error("Failed to convert data URI to Blob:", err);
                        return;
                    }
                }
            }

            audioRef.current = new Audio(resolvedUrl);
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onpause = () => setIsPlaying(false);
            audioRef.current.onerror = (e) => {
                const audio = audioRef.current;
                console.error("Audio playback error:", {
                    event: e,
                    error: audio?.error,
                    errorCode: audio?.error?.code,
                    errorMessage: audio?.error?.message,
                    networkState: audio?.networkState,
                    readyState: audio?.readyState,
                    src: audio?.src?.substring(0, 100)
                });
                setIsPlaying(false);
            };
        } catch (e) {
            console.error("Audio initialization error:", e);
        }

        // Cleanup function
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                const srcToCleanup = audioRef.current.src;
                audioRef.current.src = '';
                audioRef.current.load();
                if (srcToCleanup && srcToCleanup.startsWith('blob:')) {
                    URL.revokeObjectURL(srcToCleanup);
                }
                audioRef.current = null;
            }
        };
    }, [audioUrl]);

    const toggleAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current || !audioUrl) return;

        if (isPlaying) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => {
                console.warn("Playback prevented", e);
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    };

    // Show loader for any processing state
    const isLoading = ['pending', 'queued', 'processing', 'loading'].includes(status);

    if (isLoading) return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
    if (status === 'error' || status === 'failed') return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (status === 'completed' && audioUrl) {
        return (
            <button
                onClick={toggleAudio}
                className="flex items-center space-x-1 text-xs bg-slate-700 hover:bg-slate-600 text-indigo-300 px-2 py-1 rounded transition-colors"
                title={isPlaying ? "Stop" : "Play"}
            >
                {isPlaying ? <Square className="w-3 h-3 fill-current" /> : (icon || <Play className="w-3 h-3 fill-current" />)}
                <span>{isPlaying ? 'Stop' : label}</span>
            </button>
        );
    }
    return <Volume2 className="w-4 h-4 text-slate-600" />;
};

export default AudioPlayerButton;