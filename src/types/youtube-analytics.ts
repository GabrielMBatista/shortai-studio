export interface YoutubeVideo {
    id: string;
    channelId: string;
    youtubeVideoId: string;
    titleSnapshot: string | null;
    durationSec: number | null;
    publishedAt: Date | null;
    personaId: string | null;
    createdAt: Date;
    updatedAt: Date;
    persona?: {
        id: string;
        name: string;
    };
    metrics?: YoutubeVideoMetrics[];
    insights?: YoutubeVideoInsight;
}

export interface YoutubeVideoMetrics {
    id: string;
    videoId: string;
    date: Date;
    views: number | null;
    watchTimeMinutes: number | null;
    avgViewDurationSec: number | null;
    impressions: number | null;
    impressionsCtr: number | null;
    likes: number | null;
    comments: number | null;
    averageViewedPercent: number | null;
    trafficSource: string | null;
    deviceType: string | null;
    source: 'MANUAL' | 'API';
    importBatchId: string | null;
    createdAt: Date;
}

export interface YoutubeVideoInsight {
    id: string;
    videoId: string;
    hookScore: number;
    retentionScore: number;
    ctrScore: number;
    contentScore: number;
    growthPotential: number;
    diagnosis: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface YoutubeImportBatch {
    id: string;
    channelId: string;
    filename: string;
    totalRows: number;
    importedRows: number;
    skippedRows: number;
    errors: Array<{ row: number; error: string }> | null;
    importedAt: Date;
    importedBy: string;
}

export interface ImportResult {
    success: boolean;
    batchId: string;
    stats: {
        totalRows: number;
        imported: number;
        skipped: number;
        errors: Array<{ row: number; error: string }>;
    };
}

export interface PersonaPerformance {
    personaId: string;
    personaName: string;
    videoCount: number;
    totalViews: number;
    avgRetention: number;
    avgCtr: number;
}

export interface VideoWithStats extends YoutubeVideo {
    totalViews: number;
    totalWatchTime: number;
    totalLikes: number;
    avgRetention: number;
    avgCtr: number;
    avgViewPercentage: number;
}
