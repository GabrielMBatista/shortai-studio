import React from 'react';
import { Star, Youtube, Sparkles, Users, Video, Eye, BarChart2, RefreshCw } from 'lucide-react';
import { Channel } from '../../types/personas';
import { formatNumber } from '../../utils/format';

interface FavoriteChannelDashboardProps {
    channel: Channel;
    onViewAnalytics: (channel: Channel) => void;
    onSync: (channel: Channel) => void;
    isSyncing: boolean;
}

export function FavoriteChannelDashboard({ channel, onViewAnalytics, onSync, isSyncing }: FavoriteChannelDashboardProps) {
    return (
        <div className="bg-gradient-to-br from-yellow-500/10 via-slate-800/50 to-slate-800/50 border border-yellow-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
            <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h2 className="text-lg font-bold text-white">Favorite Channel</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Channel Info */}
                <div className="md:col-span-2 flex items-start gap-4">
                    {channel.thumbnail && (
                        <img
                            src={channel.thumbnail}
                            alt={channel.name}
                            className="w-20 h-20 rounded-full border-2 border-yellow-500/50 flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-white mb-2">{channel.name}</h3>
                        {channel.description && (
                            <p className="text-sm text-slate-400 line-clamp-2 mb-3">{channel.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Youtube className="w-3 h-3 text-red-500" />
                                YouTube
                            </div>
                            {channel.persona && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300">
                                    <Sparkles className="w-3 h-3" />
                                    {channel.persona.name}
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
                            {channel.subscriberCount ? formatNumber(channel.subscriberCount) : '-'}
                        </div>
                    </div>
                    <div className="text-center md:border-t border-slate-700/50 md:pt-3">
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                            <Video className="w-3 h-3" />
                            Videos
                        </div>
                        <div className="text-xl font-bold text-white">
                            {channel.videoCount ?? '-'}
                        </div>
                    </div>
                    <div className="text-center md:border-t border-slate-700/50 md:pt-3">
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 mb-1">
                            <Eye className="w-3 h-3" />
                            Views
                        </div>
                        <div className="text-xl font-bold text-white">
                            {channel.viewCount ? formatNumber(Number(channel.viewCount)) : '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2">
                <button
                    onClick={() => onViewAnalytics(channel)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                >
                    <BarChart2 className="w-4 h-4" />
                    View Analytics
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onSync(channel); }}
                    className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2 ${isSyncing ? 'animate-pulse' : ''}`}
                    disabled={isSyncing}
                >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                {channel.lastSyncedAt && (
                    <span className="text-xs text-slate-500 ml-auto">
                        Last synced: {new Date(channel.lastSyncedAt).toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    );
}
