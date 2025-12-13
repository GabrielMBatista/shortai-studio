import React, { useState } from 'react';
import { useChannels } from '../hooks/useChannels';
import ChannelPersonaSelector from './ChannelPersonaSelector';
import { Youtube, Users, Video, Eye, RefreshCw, BarChart2, Calendar, ThumbsUp, MessageCircle, Tag, X, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Channel } from '../types/personas';

// ... (VideoAnalytics interface and ChannelVideosModal remain same)

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
            // Optimistic update logic or just refetch could go here
            // Assuming there is an endpoint to force sync specific channel, otherwise we rely on refetch()
            await fetch(`${apiUrl}/channels/sync`, { // Hypothetical batch sync or specific
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelIds: [channel.id] })
            });
            // For now, since specific sync might not be implemented, we sleep or refetch
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

    // ... (rest of logic)

    return (
        <>
            <div className="space-y-6">
                {/* Channels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map(channel => (
                        <div
                            key={channel.id}
                            className={`bg-slate-800/50 border rounded-xl p-6 hover:bg-slate-800 transition-all group flex flex-col h-full relative ${favorites.has(channel.id) ? 'border-yellow-500/30 bg-slate-800/80 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-slate-700/50'
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
                                    onClick={() => fetchChannelVideos(channel)}
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

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
