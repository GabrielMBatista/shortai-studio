import React from 'react';
import { BarChart2, Eye, ThumbsUp, MessageCircle, Calendar, Tag, Youtube, TrendingUp } from 'lucide-react';
import { SidePanel, SidePanelSection } from '../common/SidePanel';
import { formatNumber } from '../../utils/format';

interface VideoAnalytics {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
    description?: string;
    publishedAt?: string;
    tags?: string[];
    stats: { views: number; likes: number; comments: number };
}

interface ChannelAnalyticsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    channelName: string;
    videos: VideoAnalytics[];
    isLoading: boolean;
}

export function ChannelAnalyticsPanel({ isOpen, onClose, channelName, videos, isLoading }: ChannelAnalyticsPanelProps) {
    // Calculate stats
    const totalViews = videos.reduce((sum, v) => sum + v.stats.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.stats.likes, 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : '0';
    const topVideo = videos.length > 0 ? [...videos].sort((a, b) => b.stats.views - a.stats.views)[0] : null;

    return (
        <SidePanel
            isOpen={isOpen}
            onClose={onClose}
            title={channelName}
            subtitle="Video Analytics & Insights"
            icon={BarChart2}
            width="xl"
        >
            {isLoading ? (
                <SidePanelSection>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                                <div className="flex gap-4">
                                    <div className="w-40 h-24 bg-slate-700 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SidePanelSection>
            ) : videos.length === 0 ? (
                <SidePanelSection>
                    <div className="text-center py-12">
                        <Youtube className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No videos found</p>
                    </div>
                </SidePanelSection>
            ) : (
                <>
                    {/* Overview Stats */}
                    <SidePanelSection title="Overview" className="bg-slate-800/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    Total Views
                                </div>
                                <div className="text-2xl font-bold text-white">{formatNumber(totalViews)}</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Avg Views
                                </div>
                                <div className="text-2xl font-bold text-emerald-400">{formatNumber(avgViews)}</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    Total Likes
                                </div>
                                <div className="text-2xl font-bold text-white">{formatNumber(totalLikes)}</div>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                    <BarChart2 className="w-3.5 h-3.5" />
                                    Engagement
                                </div>
                                <div className="text-2xl font-bold text-indigo-400">{engagementRate}%</div>
                            </div>
                        </div>
                    </SidePanelSection>

                    {/* Top Video */}
                    {topVideo && (
                        <SidePanelSection title="Top Performing">
                            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">🏆</span>
                                    <span className="text-xs font-semibold text-indigo-300">Best Video</span>
                                </div>
                                <div className="flex gap-4">
                                    {topVideo.thumbnail && (
                                        <img src={topVideo.thumbnail} alt={topVideo.title} className="w-32 h-20 rounded-lg object-cover flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold mb-2 line-clamp-2 text-sm">{topVideo.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-300">
                                            <span>👁️ {formatNumber(topVideo.stats.views)}</span>
                                            <span>👍 {formatNumber(topVideo.stats.likes)}</span>
                                            <span>💬 {formatNumber(topVideo.stats.comments)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SidePanelSection>
                    )}

                    {/* All Videos */}
                    <SidePanelSection title={`All Videos (${videos.length})`}>
                        <div className="space-y-3">
                            {videos.map(video => (
                                <div key={video.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 hover:border-indigo-500/30 transition-all group">
                                    <div className="flex gap-4">
                                        {video.thumbnail && (
                                            <img src={video.thumbnail} alt={video.title} className="w-40 h-24 rounded-lg object-cover flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                                {video.title}
                                            </h4>

                                            {video.description && (
                                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                                    {video.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {formatNumber(video.stats.views)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {formatNumber(video.stats.likes)}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {formatNumber(video.stats.comments)}
                                                </div>
                                                {video.publishedAt && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(video.publishedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>

                                            {video.tags && video.tags.length > 0 && (
                                                <div className="flex items-start gap-1 flex-wrap">
                                                    <Tag className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                                                    {video.tags.slice(0, 5).map(tag => (
                                                        <span key={tag} className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded text-slate-500">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors flex items-center gap-1 h-fit"
                                        >
                                            <Youtube className="w-3 h-3" />
                                            Watch
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SidePanelSection>
                </>
            )}
        </SidePanel>
    );
}
