import React, { useState } from 'react';
import { Upload, TrendingUp, TrendingDown, Users } from 'lucide-react';
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
    setRefreshKey((prev) => prev + 1);
    setActiveTab('top');
  };

  const tabs = [
    { id: 'import' as const, label: 'Import Data', icon: Upload },
    { id: 'top' as const, label: 'Top Videos', icon: TrendingUp },
    { id: 'bottom' as const, label: 'Bottom Videos', icon: TrendingDown },
    { id: 'personas' as const, label: 'Personas', icon: Users },
  ];

  return (
    <div className="youtube-analytics-dashboard">
      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon className="tab-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'import' && (
          <CSVImport channelId={channelId} onImportComplete={handleImportComplete} />
        )}

        {activeTab === 'top' && (
          <VideoInsightsList
            key={`top-${refreshKey}`}
            channelId={channelId}
            type="top"
            period="alltime"
            limit={5}
          />
        )}

        {activeTab === 'bottom' && (
          <VideoInsightsList
            key={`bottom-${refreshKey}`}
            channelId={channelId}
            type="bottom"
            limit={5}
          />
        )}

        {activeTab === 'personas' && (
          <PersonaPerformanceChart key={`personas-${refreshKey}`} channelId={channelId} />
        )}
      </div>

      <style jsx>{`
        .youtube-analytics-dashboard {
          width: 100%;
        }

        .tabs-container {
          display: flex;
          gap: 4px;
          margin-bottom: 32px;
          border-bottom: 2px solid #1e293b;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .tabs-container::-webkit-scrollbar {
          display: none;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          color: #94a3b8;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          margin-bottom: -2px;
          position: relative;
        }

        .tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 100%;
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%);
          transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 8px 8px 0 0;
        }

        .tab:hover::before {
          width: 100%;
        }

        .tab:hover {
          color: #e2e8f0;
        }

        .tab.active {
          color: #ffffff;
          border-bottom-color: #6366f1;
        }

        .tab.active::before {
          width: 100%;
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, transparent 100%);
        }

        .tab-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .tab-content {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .tabs-container {
            gap: 2px;
          }

          .tab {
            padding: 12px 18px;
            font-size: 14px;
          }

          .tab-icon {
            width: 16px;
            height: 16px;
          }

          .tab span {
            display: none;
          }

          .tab-icon {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};
