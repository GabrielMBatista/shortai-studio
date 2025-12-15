import React, { useEffect, useState } from 'react';
import { youtubeAnalyticsApi } from '@/api/youtube-analytics';
import type { YoutubeVideo } from '@/types/youtube-analytics';

interface VideoInsightsListProps {
    channelId: string;
    type: 'top' | 'bottom';
    period?: 'last7days' | 'alltime';
    limit?: number;
}

export const VideoInsightsList: React.FC<VideoInsightsListProps> = ({
    channelId,
    type,
    period = 'alltime',
    limit = 5,
}) => {
    const [videos, setVideos] = useState<YoutubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadVideos();
    }, [channelId, type, period, limit]);

    const loadVideos = async () => {
        setLoading(true);
        setError(null);

        try {
            const result =
                type === 'top'
                    ? await youtubeAnalyticsApi.getTopVideos(channelId, { period, limit })
                    : await youtubeAnalyticsApi.getBottomVideos(channelId, { limit });

            setVideos(result.videos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getScoreColor = (score: number): string => {
        if (score >= 8) return 'var(--success)';
        if (score >= 5) return 'var(--warning)';
        return 'var(--error)';
    };

    if (loading) {
        return (
            <div className="video-insights-loading">
                <div className="spinner-large" />
                <p>Loading videos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="video-insights-error">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                    <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm2 30h-4v-4h4v4zm0-8h-4V14h4v12z" />
                </svg>
                <p>{error}</p>
                <button onClick={loadVideos} className="btn-secondary">
                    Retry
                </button>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="video-insights-empty">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor">
                    <rect x="8" y="16" width="48" height="32" rx="4" strokeWidth="2" />
                    <path d="M26 24l12 8-12 8V24z" fill="currentColor" />
                </svg>
                <h4>No videos found</h4>
                <p>Import CSV data to see video analytics</p>
            </div>
        );
    }

    return (
        <div className="video-insights-list">
            <div className="list-header">
                <h3>
                    {type === 'top' ? '🏆 Top' : '📉 Bottom'} {limit} Videos
                    {type === 'top' && period === 'last7days' && ' (Last 7 Days)'}
                </h3>
            </div>

            <div className="videos-grid">
                {videos.map((video, index) => {
                    const latestMetrics = video.metrics?.[0];
                    const insights = video.insights;

                    return (
                        <div key={video.id} className="video-card">
                            <div className="video-header">
                                <div className="video-rank">#{index + 1}</div>
                                <div className="video-title-section">
                                    <h4 className="video-title">
                                        {video.titleSnapshot || 'Untitled Video'}
                                    </h4>
                                    {video.persona && (
                                        <span className="video-persona">{video.persona.name}</span>
                                    )}
                                </div>
                            </div>

                            {latestMetrics && (
                                <div className="video-metrics">
                                    <div className="metric">
                                        <span className="metric-label">Views</span>
                                        <span className="metric-value">
                                            {formatNumber(latestMetrics.views || 0)}
                                        </span>
                                    </div>
                                    {latestMetrics.impressionsCtr !== null && (
                                        <div className="metric">
                                            <span className="metric-label">CTR</span>
                                            <span className="metric-value">
                                                {(latestMetrics.impressionsCtr * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                    {latestMetrics.averageViewedPercent !== null && (
                                        <div className="metric">
                                            <span className="metric-label">Retention</span>
                                            <span className="metric-value">
                                                {(latestMetrics.averageViewedPercent * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                    {latestMetrics.likes !== null && (
                                        <div className="metric">
                                            <span className="metric-label">Likes</span>
                                            <span className="metric-value">
                                                {formatNumber(latestMetrics.likes)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {insights && (
                                <div className="video-insights">
                                    <div className="scores">
                                        <div className="score">
                                            <span className="score-label">Hook</span>
                                            <span
                                                className="score-value"
                                                style={{ color: getScoreColor(insights.hookScore) }}
                                            >
                                                {insights.hookScore.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="score">
                                            <span className="score-label">Content</span>
                                            <span
                                                className="score-value"
                                                style={{ color: getScoreColor(insights.contentScore) }}
                                            >
                                                {insights.contentScore.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="score">
                                            <span className="score-label">Potential</span>
                                            <span
                                                className="score-value"
                                                style={{ color: getScoreColor(insights.growthPotential) }}
                                            >
                                                {insights.growthPotential.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="diagnosis">
                                        {insights.diagnosis.split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="video-footer">
                                <a
                                    href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-link"
                                >
                                    Watch on YouTube →
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        .video-insights-loading,
        .video-insights-error,
        .video-insights-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          color: var(--text-secondary);
          text-align: center;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid var(--border-default);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .list-header {
          margin-bottom: 24px;
        }

        .list-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .videos-grid {
          display: grid;
          gap: 16px;
        }

        .video-card {
          background: var(--surface-dark);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .video-card:hover {
          border-color: var(--border-default);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .video-header {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .video-rank {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .video-title-section {
          flex: 1;
          min-width: 0;
        }

        .video-title {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .video-persona {
          display: inline-block;
          padding: 2px 8px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .video-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: var(--surface-light);
          border-radius: 8px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .metric-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .video-insights {
          margin-bottom: 16px;
        }

        .scores {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .score {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .score-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .score-value {
          font-size: 24px;
          font-weight: 700;
        }

        .diagnosis {
          padding: 12px;
          background: var(--surface-light);
          border-left: 3px solid var(--primary);
          border-radius: 4px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .diagnosis p {
          margin: 4px 0;
        }

        .video-footer {
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .btn-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .btn-link:hover {
          opacity: 0.8;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
};
