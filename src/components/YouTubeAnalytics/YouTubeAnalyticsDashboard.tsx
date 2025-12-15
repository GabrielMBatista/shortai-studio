import React, { useState } from 'react';
import { CSVImport } from './CSVImport';
import { VideoInsightsList } from './VideoInsightsList';
import { PersonaPerformanceChart } from './PersonaPerformanceChart';

interface YouTubeAnalyticsDashboardProps {
    channelId: string;
    channelName: string;
}

export const YouTubeAnalyticsDashboard: React.FC<YouTubeAnalyticsDashboardProps> = ({
    channelId,
    channelName,
}) => {
    const [activeTab, setActiveTab] = useState<'import' | 'top' | 'bottom' | 'personas'>(
        'import'
    );
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImportComplete = () => {
        // Refresh all data
        setRefreshKey((prev) => prev + 1);
        setActiveTab('top');
    };

    return (
        <div className="youtube-analytics-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h2>📊 YouTube Analytics</h2>
                    <p className="channel-name">{channelName}</p>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'import' ? 'active' : ''}`}
                    onClick={() => setActiveTab('import')}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
                    </svg>
                    Import Data
                </button>

                <button
                    className={`tab ${activeTab === 'top' ? 'active' : ''}`}
                    onClick={() => setActiveTab('top')}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Top Videos
                </button>

                <button
                    className={`tab ${activeTab === 'bottom' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bottom')}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        />
                    </svg>
                    Bottom Videos
                </button>

                <button
                    className={`tab ${activeTab === 'personas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personas')}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Personas
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'import' && (
                    <CSVImport channelId={channelId} onImportComplete={handleImportComplete} />
                )}

                {activeTab === 'top' && (
                    <div className="insights-section">
                        <VideoInsightsList
                            key={`top-${refreshKey}`}
                            channelId={channelId}
                            type="top"
                            period="alltime"
                            limit={5}
                        />
                    </div>
                )}

                {activeTab === 'bottom' && (
                    <div className="insights-section">
                        <VideoInsightsList
                            key={`bottom-${refreshKey}`}
                            channelId={channelId}
                            type="bottom"
                            limit={5}
                        />
                    </div>
                )}

                {activeTab === 'personas' && (
                    <div className="personas-section">
                        <PersonaPerformanceChart key={`personas-${refreshKey}`} channelId={channelId} />
                    </div>
                )}
            </div>

            <style jsx>{`
        .youtube-analytics-dashboard {
          width: 100%;
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .header-content h2 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .channel-name {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .dashboard-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--border-subtle);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          margin-bottom: -2px;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--surface-hover);
        }

        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .tab svg {
          flex-shrink: 0;
        }

        .dashboard-content {
          min-height: 400px;
        }

        .insights-section,
        .personas-section {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .dashboard-tabs {
            gap: 4px;
          }

          .tab {
            padding: 12px 16px;
            font-size: 13px;
          }

          .tab svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
        </div>
    );
};
