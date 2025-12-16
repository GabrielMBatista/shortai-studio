import React from 'react';
import { Youtube, BarChart2, Calendar, ThumbsUp, MessageCircle, Tag, Eye } from 'lucide-react';
import { Card } from '../ui';
import { useTranslation } from 'react-i18next';
import { YouTubeAnalyticsDashboard } from '../YouTubeAnalytics';

interface VideoAnalytics {
    id: string;
    title: string;
    url: string;
    thumbnail?: string;
    description?: string;
    publishedAt?: string;
    tags?: string[];
    stats: {
        views: number;
        likes: number;
        comments: number;
    };
}

interface ChannelDetailsViewProps {
    channelId: string;
    channelName: string;
    videos: VideoAnalytics[];
    isLoading: boolean;
}

const EmptyVideosCard = ({ t }: { t: any }) => (
    <Card variant="glass" padding="lg" className="text-center py-16">
        <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t('channels.no_videos_title')}</h3>
            <p className="text-slate-400 text-sm">
                {t('channels.no_videos_desc')}
            </p>
            <ul className="text-left text-sm text-slate-400 space-y-2 max-w-xs mx-auto">
                <li className="flex gap-2">
                    <span className="text-slate-600">•</span>
                    <span>{t('channels.no_videos_reason_1')}</span>
                </li>
                <li className="flex gap-2">
                    <span className="text-slate-600">•</span>
                    <span>{t('channels.no_videos_reason_2')}</span>
                </li>
                <li className="flex gap-2">
                    <span className="text-slate-600">•</span>
                    <span>{t('channels.no_videos_reason_3')}</span>
                </li>
            </ul>
            <div className="pt-4 text-xs text-slate-500">
                {t('channels.check_log')}
            </div>
        </div>
    </Card>
);

export function ChannelDetailsView({ channelId, channelName, videos, isLoading }: ChannelDetailsViewProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = React.useState<'overview' | 'videos' | 'analytics'>('overview');
    const [expandedDescriptions, setExpandedDescriptions] = React.useState<Set<string>>(new Set());

    // Stats
    const totalViews = videos.reduce((sum, v) => sum + v.stats.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.stats.likes, 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;
    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : '0';
    const topVideo = videos.length > 0 ? [...videos].sort((a, b) => b.stats.views - a.stats.views)[0] : null;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <BarChart2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">{channelName}</h2>
                        <p className="text-slate-400 mt-1">{t('channels.analytics_title')}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${activeTab === 'overview'
                            ? 'text-white bg-indigo-600 shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {t('channels.tab_overview')}
                    </button>
                    <button
                        onClick={() => setActiveTab('videos')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${activeTab === 'videos'
                            ? 'text-white bg-indigo-600 shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {t('channels.tab_videos')} <span className="ml-1 opacity-70">({videos.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${activeTab === 'analytics'
                            ? 'text-white bg-indigo-600 shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        📊 Analytics
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} variant="glass" padding="md" className="animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-32 h-20 bg-slate-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        videos.length === 0 ? (
                            <EmptyVideosCard t={t} />
                        ) : (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card variant="glass" padding="md">
                                        <div className="text-xs text-slate-500 mb-1">{t('channels.stat_total_views')}</div>
                                        <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
                                    </Card>
                                    <Card variant="glass" padding="md">
                                        <div className="text-xs text-slate-500 mb-1">{t('channels.stat_avg_views')}</div>
                                        <div className="text-2xl font-bold text-emerald-400">{avgViews.toLocaleString()}</div>
                                    </Card>
                                    <Card variant="glass" padding="md">
                                        <div className="text-xs text-slate-500 mb-1">{t('channels.stat_total_likes')}</div>
                                        <div className="text-2xl font-bold text-white">{totalLikes.toLocaleString()}</div>
                                    </Card>
                                    <Card variant="glass" padding="md">
                                        <div className="text-xs text-slate-500 mb-1">{t('channels.stat_engagement')}</div>
                                        <div className="text-2xl font-bold text-indigo-400">{engagementRate}%</div>
                                    </Card>
                                </div>

                                {/* Top Video */}
                                {topVideo && (
                                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
                                        <div className="text-sm font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                                            <span className="text-xl">🏆</span> {t('channels.top_performing')}
                                        </div>
                                        <div className="flex gap-4">
                                            {topVideo.thumbnail && (
                                                <img
                                                    src={topVideo.thumbnail}
                                                    alt={topVideo.title}
                                                    className="w-48 h-28 rounded-lg object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-white font-semibold mb-3 text-lg">{topVideo.title}</h3>
                                                <div className="flex items-center gap-6 text-sm text-slate-300">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" /> {topVideo.stats.views.toLocaleString()} {t('channels.stats_views')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="w-4 h-4" /> {topVideo.stats.likes.toLocaleString()} {t('channels.stats_likes')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-4 h-4" /> {topVideo.stats.comments.toLocaleString()} {t('channels.stats_comments')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}

                    {/* Videos Tab */}
                    {activeTab === 'videos' && (
                        videos.length === 0 ? (
                            <EmptyVideosCard t={t} />
                        ) : (
                            <div className="space-y-4">
                                {videos.map(video => (
                                    <Card key={video.id} variant="glass" padding="none" hoverable className="overflow-hidden group">
                                        <div className="flex gap-4 p-5">
                                            {/* Thumbnail */}
                                            {video.thumbnail && (
                                                <div className="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Youtube className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 space-y-3">
                                                {/* Title */}
                                                <h3 className="text-white font-semibold line-clamp-2 group-hover:text-indigo-400 transition-colors leading-snug">
                                                    {video.title}
                                                </h3>

                                                {/* Description */}
                                                {video.description && (
                                                    <div>
                                                        <p className={`text-sm text-slate-400 leading-relaxed ${!expandedDescriptions.has(video.id) && video.description.length > 150 ? 'line-clamp-2' : ''}`}>
                                                            {video.description}
                                                        </p>
                                                        {video.description.length > 150 && (
                                                            <button
                                                                onClick={() => {
                                                                    const next = new Set(expandedDescriptions);
                                                                    if (expandedDescriptions.has(video.id)) next.delete(video.id);
                                                                    else next.add(video.id);
                                                                    setExpandedDescriptions(next);
                                                                }}
                                                                className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 font-medium"
                                                            >
                                                                {expandedDescriptions.has(video.id) ? `− ${t('channels.show_less')}` : `+ ${t('channels.show_more')}`}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="font-medium">{video.stats.views.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span className="font-medium">{video.stats.likes.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span className="font-medium">{video.stats.comments.toLocaleString()}</span>
                                                    </div>
                                                    {video.publishedAt && (
                                                        <div className="flex items-center gap-1.5 ml-auto">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tags */}
                                                {video.tags && video.tags.length > 0 && (
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <Tag className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                                        {video.tags.slice(0, 5).map(tag => (
                                                            <span key={tag} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 hover:bg-slate-700 transition-colors">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {video.tags.length > 5 && (
                                                            <span className="text-xs text-slate-500">+{video.tags.length - 5}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Watch Button */}
                                            <a
                                                href={video.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 self-start px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/50 hover:scale-105"
                                            >
                                                <Youtube className="w-4 h-4" />
                                                {t('channels.watch')}
                                            </a>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <YouTubeAnalyticsDashboard
                            channelId={channelId}
                            channelName={channelName}
                        />
                    )}
                </>
            )}
        </div>
    );
}
