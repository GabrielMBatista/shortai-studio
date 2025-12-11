import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Youtube, RefreshCw, Clock } from 'lucide-react';

interface Channel {
    id: string;
    accountId: string;
    name: string;
    email?: string;
    thumbnail?: string;
    statistics?: {
        subscriberCount: string;
        videoCount: string;
        viewCount: string;
    };
    provider: string;
    lastSync: string;
    status: 'active' | 'inactive' | 'error';
}

const ChannelsPage: React.FC = () => {
    const { t } = useTranslation();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    const fetchData = async () => {
        try {
            const channelsRes = await fetch(`${apiUrl}/channels`);
            if (channelsRes.ok) setChannels(await channelsRes.json());
        } catch (error) {
            console.error("Failed to fetch channel data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleConnect = () => {
        window.location.href = `${apiUrl}/auth/signin/google?callbackUrl=${window.location.origin}`;
    };

    const formatNumber = (num?: string) => {
        if (!num) return '0';
        const n = parseInt(num);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    return (
        <div className="flex-1 bg-[#0f172a] p-4 md:p-8 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('channels.title', 'Channel Manager')}</h1>
                        <p className="text-slate-400">{t('channels.subtitle', 'Manage your connected YouTube channels')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleConnect}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-600/20"
                        >
                            <Plus className="w-5 h-5" />
                            {t('channels.connect_new', 'Connect Channel')}
                        </button>
                    </div>
                </div>

                {/* Connected Channels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.length > 0 ? (
                        channels.map(channel => (
                            <div key={channel.id} className={`bg-slate-800/50 border ${channel.status === 'error' ? 'border-red-500/50' : 'border-slate-700/50'} rounded-xl p-6 backdrop-blur-sm hover:bg-slate-800 transition-colors group relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-red-600/20 transition-colors"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {channel.thumbnail ? (
                                                <img src={channel.thumbnail} alt={channel.name} className="w-12 h-12 rounded-full border-2 border-slate-700" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
                                                    {channel.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1">
                                                <Youtube className="w-4 h-4 text-red-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold truncate max-w-[150px]" title={channel.name}>{channel.name}</h3>
                                            {channel.email && (
                                                <p className="text-[10px] text-slate-500 truncate max-w-[150px] mb-0.5" title={channel.email}>
                                                    {channel.email}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                                                {channel.provider} • <span className={channel.status === 'error' ? 'text-red-400' : ''}>{channel.status}</span>
                                            </p>
                                            {channel.status === 'error' && (
                                                <button onClick={handleConnect} className="text-xs text-red-400 hover:text-red-300 underline mt-1 flex items-center gap-1">
                                                    <RefreshCw className="w-3 h-3" /> Reconnect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {channel.status === 'active' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-700/50 mb-2">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{formatNumber(channel.statistics?.subscriberCount)}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Subs</p>
                                    </div>
                                    <div className="text-center border-l border-slate-700/50">
                                        <p className="text-lg font-bold text-white">{formatNumber(channel.statistics?.videoCount)}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Videos</p>
                                    </div>
                                    <div className="text-center border-l border-slate-700/50">
                                        <p className="text-lg font-bold text-white">{formatNumber(channel.statistics?.viewCount)}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Views</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    Last synced: {new Date(channel.lastSync).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-800/20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4 text-slate-600">
                                <Youtube className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">{isLoading ? 'Loading channels...' : 'No channels connected'}</h3>
                            <p className="text-slate-400 mb-4">Connect your YouTube account to see your channel stats.</p>
                            <button
                                onClick={handleConnect}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Connect Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChannelsPage;
