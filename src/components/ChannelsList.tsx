import React, { useState } from 'react';
import { useChannels } from '../hooks/useChannels';
import ChannelPersonaSelector from './ChannelPersonaSelector';
import { Youtube, Users, Video, Eye, RefreshCw, BarChart2, Star, Sparkles, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Channel } from '../types/personas';
import { ChannelVideosModal } from './Channels/ChannelVideosModal';
import { FavoriteChannelDashboard } from './Channels/FavoriteChannelDashboard';
import { formatNumber } from '../utils/format';

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

export default function ChannelsList() {
    const { t } = useTranslation();
    const { channels, loading, error, refetch, updateChannel } = useChannels();
    const [selectedChannel, setSelectedChannel] = useState<{ id: string, name: string } | null>(null);
    const [channelVideos, setChannelVideos] = useState<VideoAnalytics[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('favoriteChannels');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    const toggleFavorite = (id: string) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            localStorage.setItem('favoriteChannels', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const handleSync = async (channel: Channel) => {
        if (syncingIds.has(channel.id)) return;

        setSyncingIds(prev => new Set(prev).add(channel.id));
        try {
            await fetch(`${apiUrl}/channels/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelIds: [channel.id] })
            });
            await refetch();
        } catch (err) {
            console.error("Sync failed", err);
        } finally {
            setSyncingIds(prev => {
                const next = new Set(prev);
                next.delete(channel.id);
                return next;
            });
        }
    };

    const handleViewAnalytics = async (channel: Channel) => {
        setSelectedChannel({ id: channel.id, name: channel.name });
        setIsLoadingVideos(true);

        try {
            const response = await fetch(`${apiUrl}/channels/${channel.id}/videos?accountId=${channel.googleAccountId}`);
            if (!response.ok) throw new Error('Failed to fetch videos');
            const videos: VideoAnalytics[] = await response.json();
            setChannelVideos(videos);
        } catch (err) {
            console.error('[ChannelsList] Failed to fetch videos:', err);
            setChannelVideos([]);
        } finally {
            setIsLoadingVideos(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Favorite Channel Dashboard */}
                {(() => {
                    const favoriteChannel = channels.find(ch => favorites.has(ch.id));
                    if (!favoriteChannel) return null;

                    return (
                        <div className="bg-gradient-to-br from-yellow-500/10 via-slate-800/50 to-slate-800/50 border border-yellow-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <h2 className="text-lg font-bold text-white">Favorite Channel</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Channel Info */}
                                <div className="md:col-span-2 flex items-start gap-4">
                                    {favoriteChannel.thumbnail && (
                                        <img
                                            src={favoriteChannel.thumbnail}
                                            alt={favoriteChannel.name}
                                            className="w-20 h-20 rounded-full border-2 border-yellow-500/50 flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-bold text-white mb-2">{favoriteChannel.name}</h3>
                                        {favoriteChannel.description && (
                                            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{favoriteChannel.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <Youtube className="w-3 h-3 text-red-500" />
                                                YouTube
                                            </div>
                                            {favoriteChannel.persona && (
                                                <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300">
                                                    <Sparkles className="w-3 h-3" />
                                                    {favoriteChannel.persona.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 md:grid-cols-1 gap-3 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                                            <Users className="w-3 h-3" />
                                            Subs
                                        </div>
                                        <div className="text-xl font-bold text-yellow-400">
                                            {favoriteChannel.subscriberCount ? formatNumber(favoriteChannel.subscriberCount) : '-'}
                                        </div>
                                    </div>
                                    <div className="text-center md:border-t border-slate-700/50 md:pt-3">
                                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                                            <Video className="w-3 h-3" />
                                            Videos
                                        </div>
                                        <div className="text-xl font-bold text-white">
                                            {favoriteChannel.videoCount ?? '-'}
                                        </div>
                                    </div>
                                    <div className="text-center md:border-t border-slate-700/50 md:pt-3">
                                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                                            <Eye className="w-3 h-3" />
                                            Views
                                        </div>
                                        <div className="text-xl font-bold text-white">
                                            {favoriteChannel.viewCount ? formatNumber(Number(favoriteChannel.viewCount)) : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2">
                                <button
                                    onClick={() => handleViewAnalytics(favoriteChannel)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <BarChart2 className="w-4 h-4" />
                                    View Analytics
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSync(favoriteChannel); }}
                                    className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2 ${syncingIds.has(favoriteChannel.id) ? 'animate-pulse' : ''}`}
                                    disabled={syncingIds.has(favoriteChannel.id)}
                                >
                                    <RefreshCw className={`w-4 h-4 ${syncingIds.has(favoriteChannel.id) ? 'animate-spin' : ''}`} />
                                    {syncingIds.has(favoriteChannel.id) ? 'Syncing...' : 'Sync Now'}
                                </button>
                                {favoriteChannel.lastSyncedAt && (
                                    <span className="text-xs text-slate-500 ml-auto">
                                        Last synced: {new Date(favoriteChannel.lastSyncedAt).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {/* Channels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map(channel => (
                        <div
                            key={channel.id}
                            onClick={() => handleViewAnalytics(channel)}
                            className={`bg-slate-800/50 border rounded-xl p-6 hover:bg-slate-800 transition-all group flex flex-col h-full relative cursor-pointer ${favorites.has(channel.id) ? 'border-yellow-500/30 bg-slate-800/80 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-slate-700/50'
                                }`}
                        >
                            {/* Channel Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    {channel.thumbnail ? (
                                        <img
                                            src={channel.thumbnail}
                                            alt={channel.name}
                                            className="w-12 h-12 rounded-full border-2 border-slate-700"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                            <Youtube className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <h3 className="text-white font-bold truncate max-w-[150px] flex items-center gap-2">
                                            {channel.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                            <Youtube className="w-3 h-3 text-red-500" />
                                            YouTube
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(channel.id); }}
                                        className={`p-1.5 rounded-lg transition-colors ${favorites.has(channel.id)
                                            ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10'
                                            : 'text-slate-600 hover:text-yellow-400 hover:bg-slate-700'
                                            }`}
                                        title={favorites.has(channel.id) ? "Unfavorite" : "Favorite"}
                                    >
                                        <Star className={`w-4 h-4 ${favorites.has(channel.id) ? 'fill-yellow-400' : ''}`} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSync(channel); }}
                                        className={`p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors ${syncingIds.has(channel.id) ? 'animate-spin text-emerald-500' : ''}`}
                                        title="Sync Stats"
                                        disabled={syncingIds.has(channel.id)}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <div className={`w-2.5 h-2.5 rounded-full ${channel.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-700/50 mb-4 bg-slate-900/30 -mx-6 px-6">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                        <Users className="w-3 h-3" />
                                        Subs
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                        {channel.subscriberCount ? formatNumber(channel.subscriberCount) : '-'}
                                    </div>
                                </div>
                                <div className="text-center border-l border-slate-700/50">
                                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                        <Video className="w-3 h-3" />
                                        Videos
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                        {channel.videoCount ?? '-'}
                                    </div>
                                </div>
                                <div className="text-center border-l border-slate-700/50">
                                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                        <Eye className="w-3 h-3" />
                                        Views
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                        {channel.viewCount ? formatNumber(Number(channel.viewCount)) : '-'}
                                    </div>
                                </div>
                            </div>

                            {/* Persona Selector */}
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Tag className="w-3 h-3 text-indigo-400" />
                                    AI Persona
                                </label>
                                <ChannelPersonaSelector
                                    channel={channel}
                                    onUpdate={updateChannel}
                                />
                            </div>

                            {/* Actions */}
                            <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between gap-3">
                                <button
                                    onClick={() => handleViewAnalytics(channel)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700/30 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                    <BarChart2 className="w-3.5 h-3.5" />
                                    Analytics
                                </button>
                            </div>

                            {/* Last Synced */}
                            {channel.lastSyncedAt && (
                                <div className="mt-3 text-[10px] text-center text-slate-600">
                                    Last synced: {new Date(channel.lastSyncedAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Analytics Modal */}
            {selectedChannel && (
                <ChannelVideosModal
                    isOpen={!!selectedChannel}
                    onClose={() => setSelectedChannel(null)}
                    channelName={selectedChannel.name}
                    videos={channelVideos}
                    isLoading={isLoadingVideos}
                />
            )}
        </>
    );
}
