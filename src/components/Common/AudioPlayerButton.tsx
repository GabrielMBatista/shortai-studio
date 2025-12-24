import React, { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Volume2, Play, Square } from 'lucide-react';
import { useGlobalAudioManager } from '../../hooks/useGlobalAudioManager';

interface AudioPlayerButtonProps {
    audioUrl?: string;
    status: string;
    label?: string;
    icon?: React.ReactNode;
}

const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({ audioUrl, status, label = "Listen", icon }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const { play, stop, isPlaying: checkIsPlaying } = useGlobalAudioManager();
    const audioKeyRef = useRef<string>('');

    // Gerar chave única para este botão
    useEffect(() => {
        audioKeyRef.current = `audio-${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Sincronizar estado local com o manager global
    useEffect(() => {
        const interval = setInterval(() => {
            const playing = checkIsPlaying(audioKeyRef.current);
            if (playing !== isPlaying) {
                setIsPlaying(playing);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, checkIsPlaying]);

    const toggleAudio = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioUrl) return;

        if (isPlaying) {
            stop();
            setIsPlaying(false);
            return;
        }

        try {
            let resolvedUrl = audioUrl;

            // Convert data URI to Blob URL for compatibility
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
                        resolvedUrl = URL.createObjectURL(blob);
                    } catch (err) {
                        console.error("Failed to convert data URI to Blob:", err);
                        return;
                    }
                }
            }

            setIsPlaying(true);
            await play(resolvedUrl, audioKeyRef.current);
            setIsPlaying(false);
        } catch (e) {
            console.warn("Playback failed/prevented", e);
            setIsPlaying(false);
        }
    };

    // Cleanup on unmount - stop if this button's audio is playing
    useEffect(() => {
        return () => {
            if (checkIsPlaying(audioKeyRef.current)) {
                stop();
            }
        };
    }, [stop, checkIsPlaying]);

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