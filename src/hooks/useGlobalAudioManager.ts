import { useRef, useCallback } from 'react';

/**
 * Hook singleton para gerenciar reprodução de áudio globalmente
 * Garante que apenas um áudio toca por vez
 */
class AudioManager {
    private currentAudio: HTMLAudioElement | null = null;
    private currentKey: string | null = null;

    play(audioUrl: string, key: string): Promise<void> {
        // Se já está tocando este mesmo áudio, não faz nada
        if (this.currentKey === key && this.currentAudio && !this.currentAudio.paused) {
            return Promise.resolve();
        }

        // Parar áudio anterior se existir
        this.stop();

        return new Promise((resolve, reject) => {
            try {
                const audio = new Audio(audioUrl);
                this.currentAudio = audio;
                this.currentKey = key;

                audio.onended = () => {
                    this.cleanup();
                    resolve();
                };

                audio.onerror = (e) => {
                    console.error('[AudioManager] Playback error:', audio.error);
                    this.cleanup();
                    reject(audio.error);
                };

                audio.play()
                    .then(() => resolve())
                    .catch((err) => {
                        console.warn('[AudioManager] Play failed:', err);
                        this.cleanup();
                        reject(err);
                    });
            } catch (err) {
                console.error('[AudioManager] Failed to create audio:', err);
                this.cleanup();
                reject(err);
            }
        });
    }

    stop() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.cleanup();
        }
    }

    isPlaying(key?: string): boolean {
        if (!this.currentAudio) return false;
        if (key && this.currentKey !== key) return false;
        return !this.currentAudio.paused;
    }

    private cleanup() {
        if (this.currentAudio) {
            this.currentAudio.src = '';
            this.currentAudio = null;
        }
        this.currentKey = null;
    }
}

// Singleton instance
const globalAudioManager = new AudioManager();

/**
 * Hook para usar o gerenciador de áudio global
 */
export function useGlobalAudioManager() {
    return {
        play: useCallback((audioUrl: string, key: string) => {
            return globalAudioManager.play(audioUrl, key);
        }, []),

        stop: useCallback(() => {
            globalAudioManager.stop();
        }, []),

        isPlaying: useCallback((key?: string) => {
            return globalAudioManager.isPlaying(key);
        }, [])
    };
}
