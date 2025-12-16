import React, { useEffect, useState } from 'react';
import { Play, Eye, ThumbsUp, MessageCircle, TrendingUp, Activity, Zap, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { youtubeAnalyticsApi } from '@/api/youtube-analytics';
import type { YoutubeVideo } from '@/types/youtube-analytics';
import { Card } from '../ui';

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
        if (score >= 8) return '#10b981'; // green
        if (score >= 5) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    const getRankBadge = (index: number) => {
        const medals = ['🥇', '🥈', '🥉'];
        if (index < 3) return medals[index];
        return `#${index + 1}`;
    };

    if (loading) {
        return (
            <div className="state-container">
                <Loader2 className="icon-spin" size={48} />
                <p className="state-text">Loading insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="state-container">
                <AlertCircle size={48} className="icon-error" />
                <p className="state-title">Failed to load videos</p>
                <p className="state-text">{error}</p>
                <button onClick={loadVideos} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="state-container">
                <Play size={64} strokeWidth={1.5} className="icon-empty" />
                <h4 className="state-title">No videos found</h4>
                <p className="state-text">Import CSV data to see video analytics</p>
            </div>
        );
    }

    return (
        <div className="video-insights-list">
            {/* Header */}
            <div className="list-header">
                <div className="header-badge">
                    {type === 'top' ? <TrendingUp size={20} /> : <Activity size={20} />}
                </div>
                <h3 className="list-title">
                    {type === 'top' ? 'Top' : 'Bottom'} {limit} Videos
                    {type === 'top' && period === 'last7days' && (
                        <span className="period-badge">Last 7 Days</span>
                    )}
                </h3>
            </div>

            {/* Videos Grid */}
            <div className="videos-grid">
                {videos.map((video, index) => {
                    const latestMetrics = video.metrics?.[0];
                    const insights = video.insights;

                    return (
                        <Card
                            key={video.id}
                            variant="glass"
                            padding="lg"
                            hoverable
                            className="video-card"
                        >
                            {/* Header */}
                            <div className="card-header">
                                <div className="rank-badge">{getRankBadge(index)}</div>
                                <div className="title-section">
                                    <h4 className="video-title">
                                        {video.titleSnapshot || 'Untitled Video'}
                                    </h4>
                                    {video.persona && (
                                        <span className="persona-tag">{video.persona.name}</span>
                                    )}
                                </div>
                            </div>

                            {/* Metrics */}
                            {latestMetrics && (
                                <div className="metrics-grid">
                                    <div className="metric-item">
                                        <Eye className="metric-icon" size={16} />
                                        <div>
                                            <div className="metric-label">Views</div>
                                            <div className="metric-value">
                                                {formatNumber(latestMetrics.views || 0)}
                                            </div>
                                        </div>
                                    </div>

                                    {latestMetrics.impressionsCtr !== null && (
                                        <div className="metric-item">
                                            <Zap className="metric-icon" size={16} />
                                            <div>
                                                <div className="metric-label">CTR</div>
                                                <div className="metric-value">
                                                    {(latestMetrics.impressionsCtr * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {latestMetrics.averageViewedPercent !== null && (
                                        <div className="metric-item">
                                            <Activity className="metric-icon" size={16} />
                                            <div>
                                                <div className="metric-label">Retention</div>
                                                <div className="metric-value">
                                                    {(latestMetrics.averageViewedPercent * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {latestMetrics.likes !== null && (
                                        <div className="metric-item">
                                            <ThumbsUp className="metric-icon" size={16} />
                                            <div>
                                                <div className="metric-label">Likes</div>
                                                <div className="metric-value">
                                                    {formatNumber(latestMetrics.likes)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Insights */}
                            {insights && (
                                <div className="insights-section">
                                    <div className="scores-row">
                                        <div className="score-item">
                                            <div className="score-label">Hook</div>
                                            <div
                                                className="score-value"
                                                style={{ color: getScoreColor(insights.hookScore) }}
                                            >
                                                {insights.hookScore.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="score-item">
                                            <div className="score-label">Content</div>
                                            <div
                                                className="score-value"
                                                style={{ color: getScoreColor(insights.contentScore) }}
                                            >
                                                {insights.contentScore.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="score-item">
                                            <div className="score-label">Potential</div>
                                            <div
                                                className="score-value"
                                                style={{ color: getScoreColor(insights.growthPotential) }}
                                            >
                                                {insights.growthPotential.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="diagnosis">
                                        {insights.diagnosis.split('\n').filter(Boolean).map((line, i) => {
                                            const isPositive = line.startsWith('📊') || line.startsWith('✅');
                                            const isNegative = line.startsWith('🎯') || line.startsWith('⚠️');
                                            return (
                                                <div
                                                    key={i}
                                                    className={`diagnosis-item ${isPositive ? 'positive' : isNegative ? 'negative' : ''
                                                        }`}
                                                >
                                                    {line}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="card-footer">
                                <a
                                    href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="watch-link"
                                >
                                    <Play size={16} />
                                    <span>Watch on YouTube</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <style jsx>{`
        .video-insights-list {
          width: 100%;
        }

        /* States */
        .state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }

        .icon-spin {
          color: #6366f1;
          animation: spin 1s linear infinite;
        }

        .icon-error {
          color: #ef4444;
          margin-bottom: 16px;
        }

        .icon-empty {
          color: #475569;
          margin-bottom: 16px;
        }

        .state-title {
          margin: 16px 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .state-text {
          margin: 0;
          font-size: 14px;
          color: #94a3b8;
        }

        .retry-button {
          margin-top: 20px;
          padding: 10px 24px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-button:hover {
          background: #5558e3;
          transform: translateY(-1px);
        }

        /* Header */
        .list-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .header-badge {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          color: white;
        }

        .list-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .period-badge {
          padding: 4px 12px;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }

        /* Videos Grid */
        .videos-grid {
          display: grid;
          gap: 20px;
        }

        .video-card {
          position: relative;
          overflow: hidden;
        }

        /* Card Header */
        .card-header {
          display: flex;
          gap: 14px;
          margin-bottom: 20px;
        }

        .rank-badge {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .title-section {
          flex: 1;
          min-width: 0;
        }

        .video-title {
          margin: 0 0 6px 0;
          font-size: 17px;
          font-weight: 600;
          color: #f1f5f9;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .persona-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          background: rgba(139, 92, 246, 0.15);
          color: #c4b5fd;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Metrics */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 16px;
          padding: 18px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid rgba(100, 116, 139, 0.1);
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .metric-icon {
          color: #6366f1;
          flex-shrink: 0;
        }

        .metric-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
        }

        /* Insights */
        .insights-section {
          margin-bottom: 20px;
        }

        .scores-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
          border: 1px solid rgba(100, 116, 139, 0.1);
        }

        .score-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          letter-spacing: 0.5px;
        }

        .score-value {
          font-size: 26px;
          font-weight: 700;
        }

        .diagnosis {
          padding: 16px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-left: 3px solid #6366f1;
          border-radius: 8px;
        }

        .diagnosis-item {
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .diagnosis-item:last-child {
          margin-bottom: 0;
        }

        .diagnosis-item.positive {
          color: #86efac;
        }

        .diagnosis-item.negative {
          color: #fca5a5;
        }

        /* Footer */
        .card-footer {
          padding-top: 16px;
          border-top: 1px solid rgba(100, 116, 139, 0.15);
        }

        .watch-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .watch-link:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          transform: translateX(2px);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .scores-row {
            gap: 8px;
          }

          .score-item {
            padding: 12px 8px;
          }

          .score-value {
            font-size: 22px;
          }
        }
      `}</style>
        </div>
    );
};
