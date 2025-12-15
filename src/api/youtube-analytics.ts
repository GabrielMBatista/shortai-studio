import type {
    YoutubeVideo,
    ImportResult,
    PersonaPerformance,
    VideoWithStats,
} from '@/types/youtube-analytics';

class YoutubeAnalyticsApi {
    /**
     * Import metrics from CSV file
     */
    async importCSV(channelId: string, file: File): Promise<ImportResult> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('channelId', channelId);

        const response = await fetch('/api/youtube-analytics/import', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to import CSV');
        }

        return response.json();
    }

    /**
     * Get top performing videos
     */
    async getTopVideos(
        channelId: string,
        options: {
            period?: 'last7days' | 'alltime';
            limit?: number;
        } = {}
    ): Promise<{ videos: YoutubeVideo[] }> {
        const params = new URLSearchParams({
            channelId,
            type: 'top',
            period: options.period || 'alltime',
            limit: String(options.limit || 5),
        });

        const response = await fetch(`/api/youtube-analytics/videos?${params}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get top videos');
        }

        return response.json();
    }

    /**
     * Get bottom performing videos
     */
    async getBottomVideos(
        channelId: string,
        options: { limit?: number } = {}
    ): Promise<{ videos: YoutubeVideo[] }> {
        const params = new URLSearchParams({
            channelId,
            type: 'bottom',
            limit: String(options.limit || 5),
        });

        const response = await fetch(`/api/youtube-analytics/videos?${params}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get bottom videos');
        }

        return response.json();
    }

    /**
     * Get persona performance comparison
     */
    async getPersonaPerformance(
        channelId: string
    ): Promise<{ performance: PersonaPerformance[] }> {
        const params = new URLSearchParams({ channelId });

        const response = await fetch(
            `/api/youtube-analytics/personas/performance?${params}`,
            {
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get persona performance');
        }

        return response.json();
    }

    /**
     * Activate a persona for a channel
     */
    async activatePersona(
        channelId: string,
        personaId: string
    ): Promise<{ success: boolean }> {
        const response = await fetch(`/api/channels/${channelId}/persona/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ personaId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to activate persona');
        }

        return response.json();
    }
}

export const youtubeAnalyticsApi = new YoutubeAnalyticsApi();
