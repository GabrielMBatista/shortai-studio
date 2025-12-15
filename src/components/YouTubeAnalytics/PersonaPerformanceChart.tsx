import React, { useEffect, useState } from 'react';
import { youtubeAnalyticsApi } from '@/api/youtube-analytics';
import type { PersonaPerformance } from '@/types/youtube-analytics';

interface PersonaPerformanceChartProps {
    channelId: string;
}

export const PersonaPerformanceChart: React.FC<PersonaPerformanceChartProps> = ({
    channelId,
}) => {
    const [performance, setPerformance] = useState<PersonaPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPerformance();
    }, [channelId]);

    const loadPerformance = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await youtubeAnalyticsApi.getPersonaPerformance(channelId);
            setPerformance(result.performance);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load performance');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getPerformanceGrade = (avgRetention: number, avgCtr: number): string => {
        const score = (avgRetention + avgCtr * 10) / 2;
        if (score >= 0.8) return 'A';
        if (score >= 0.6) return 'B';
        if (score >= 0.4) return 'C';
        if (score >= 0.2) return 'D';
        return 'F';
    };

    const getGradeColor = (grade: string): string => {
        switch (grade) {
            case 'A':
                return '#22c55e';
            case 'B':
                return '#3b82f6';
            case 'C':
                return '#f59e0b';
            case 'D':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div className="persona-performance-loading">
                <div className="spinner-large" />
                <p>Loading persona performance...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="persona-performance-error">
                <p>{error}</p>
                <button onClick={loadPerformance} className="btn-secondary">
                    Retry
                </button>
            </div>
        );
    }

    if (performance.length === 0) {
        return (
            <div className="persona-performance-empty">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor">
                    <circle cx="32" cy="20" r="8" strokeWidth="2" />
                    <path
                        d="M16 44c0-8.837 7.163-16 16-16s16 7.163 16 16"
                        strokeWidth="2"
                    />
                </svg>
                <h4>No persona data</h4>
                <p>Assign personas to videos to see performance comparison</p>
            </div>
        );
    }

    // Normalize data for visual bar charts
    const maxViews = Math.max(...performance.map((p) => p.totalViews));

    return (
        <div className="persona-performance-chart">
            <div className="chart-header">
                <h3>🎭 Persona Performance Comparison</h3>
                <p className="chart-description">
                    Compare how different personas perform across your content
                </p>
            </div>

            <div className="personas-list">
                {performance.map((persona, index) => {
                    const grade = getPerformanceGrade(persona.avgRetention, persona.avgCtr);
                    const viewPercentage = (persona.totalViews / maxViews) * 100;

                    return (
                        <div key={persona.personaId} className="persona-item">
                            <div className="persona-rank">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>

                            <div className="persona-info">
                                <div className="persona-header-row">
                                    <h4 className="persona-name">{persona.personaName}</h4>
                                    <span
                                        className="persona-grade"
                                        style={{ backgroundColor: getGradeColor(grade) }}
                                    >
                                        {grade}
                                    </span>
                                </div>

                                <div className="persona-stats">
                                    <span className="stat">
                                        {persona.videoCount} video{persona.videoCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="stat-separator">•</span>
                                    <span className="stat">{formatNumber(persona.totalViews)} views</span>
                                </div>

                                <div className="views-bar-container">
                                    <div
                                        className="views-bar"
                                        style={{
                                            width: `${viewPercentage}%`,
                                            background: `linear-gradient(90deg, ${getGradeColor(grade)}, ${getGradeColor(grade)}88)`,
                                        }}
                                    />
                                </div>

                                <div className="persona-metrics">
                                    <div className="metric-box">
                                        <span className="metric-label">Avg Retention</span>
                                        <span className="metric-value">
                                            {(persona.avgRetention * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="metric-box">
                                        <span className="metric-label">Avg CTR</span>
                                        <span className="metric-value">
                                            {(persona.avgCtr * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="metric-box">
                                        <span className="metric-label">Views/Video</span>
                                        <span className="metric-value">
                                            {formatNumber(Math.round(persona.totalViews / persona.videoCount))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
        .persona-performance-loading,
        .persona-performance-error,
        .persona-performance-empty {
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

        .chart-header {
          margin-bottom: 24px;
        }

        .chart-header h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .chart-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .personas-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .persona-item {
          background: var(--surface-dark);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          transition: all 0.2s;
        }

        .persona-item:hover {
          border-color: var(--border-default);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .persona-rank {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-light);
          border-radius: 12px;
          font-size: 24px;
          font-weight: 700;
        }

        .persona-info {
          flex: 1;
          min-width: 0;
        }

        .persona-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .persona-name {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .persona-grade {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
        }

        .persona-stats {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .stat-separator {
          opacity: 0.5;
        }

        .views-bar-container {
          height: 8px;
          background: var(--surface-light);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .views-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease-out;
        }

        .persona-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .metric-box {
          padding: 12px;
          background: var(--surface-light);
          border-radius: 8px;
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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .persona-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};
