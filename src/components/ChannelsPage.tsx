import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Youtube, RefreshCw, CheckCircle, Clock, AlertTriangle, ExternalLink, UploadCloud } from 'lucide-react';
import { ScheduleUploadModal } from './ScheduleUploadModal';

interface Channel {
    id: string;
    accountId: string;
    name: string;
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

interface TransferJob {
    id: string;
    driveFileName: string;
    status: 'QUEUED' | 'PROCESSING' | 'WAITING_QUOTA' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
    progress: number;
    youtubeVideoId: string | null;
    createdAt: string;
    completedAt?: string;
    lastError?: string;
}

const ChannelsPage: React.FC = () => {
    const { t } = useTranslation();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [jobs, setJobs] = useState<TransferJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    const fetchData = async () => {
        try {
            const [channelsRes, jobsRes] = await Promise.all([
                fetch(`${apiUrl}/channels`),
                fetch(`${apiUrl}/channels/jobs`)
            ]);

            if (channelsRes.ok) setChannels(await channelsRes.json());
            if (jobsRes.ok) setJobs(await jobsRes.json());
        } catch (error) {
            console.error("Failed to fetch channel data", error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll for job updates every 10 seconds
        const interval = setInterval(() => {
            fetch(`${apiUrl}/channels/jobs`)
                .then(res => res.ok ? res.json() : [])
                .then(data => setJobs(data))
                .catch(e => console.error(e));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleConnect = () => {
        window.location.href = `${apiUrl}/auth/signin/google?callbackUrl=${window.location.origin}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500/10 text-green-400';
            case 'PROCESSING': return 'bg-blue-500/10 text-blue-400';
            case 'FAILED': return 'bg-red-500/10 text-red-400';
            case 'WAITING_QUOTA': return 'bg-yellow-500/10 text-yellow-400';
            case 'SCHEDULED': return 'bg-purple-500/10 text-purple-400';
            default: return 'bg-slate-700 text-slate-400';
        }
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
                        <p className="text-slate-400">{t('channels.subtitle', 'Manage your connected YouTube channels and automated uploads')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <UploadCloud className="w-5 h-5" />
                            {t('channels.upload_new', 'Upload & Schedule')}
                        </button>
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
                            <h3 className="text-lg font-medium text-white mb-1">No channels connected</h3>
                            <p className="text-slate-400 mb-4">Connect your YouTube account to start scheduling uploads.</p>
                            <button
                                onClick={handleConnect}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Connect Now
                            </button>
                        </div>
                    )}
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg"><RefreshCw className="w-5 h-5 text-blue-400" /></div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Jobs Processing</p>
                            <p className="text-xl font-bold text-white">{jobs.filter(j => ['processing', 'queued'].includes(j.status.toLowerCase())).length}</p>
                        </div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg"><Clock className="w-5 h-5 text-purple-400" /></div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Scheduled</p>
                            <p className="text-xl font-bold text-white">{jobs.filter(j => j.status === 'SCHEDULED').length}</p>
                        </div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-green-400" /></div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wide">Completed Today</p>
                            <p className="text-xl font-bold text-white">{jobs.filter(j => j.status === 'COMPLETED' && new Date(j.createdAt).toDateString() === new Date().toDateString()).length}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            Activity Log
                            {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
                        </h3>
                        <button onClick={() => { setIsRefreshing(true); fetchData(); }} className="text-sm text-slate-400 hover:text-white transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading activity...</div>
                    ) : jobs.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                                <Clock className="w-8 h-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">No activity yet</h3>
                            <p className="text-slate-400">Connect a channel and upload videos to Drive to start.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-800/80 text-slate-300 uppercase text-xs font-semibold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">File Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Progress</th>
                                        <th className="px-6 py-4">YouTube</th>
                                        <th className="px-6 py-4">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {jobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate" title={job.driveFileName}>
                                                {job.driveFileName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-white/5 ${getStatusColor(job.status)}`}>
                                                    {job.status === 'COMPLETED' && <CheckCircle className="w-3 h-3" />}
                                                    {job.status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                                                    {(job.status === 'PROCESSING' || job.status === 'QUEUED') && <RefreshCw className="w-3 h-3 animate-spin" />}
                                                    {job.status === 'SCHEDULED' && <Clock className="w-3 h-3" />}
                                                    {job.status}
                                                </span>
                                                {job.lastError && (
                                                    <div className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={job.lastError}>
                                                        {job.lastError}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 w-48">
                                                <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-500 ${job.status === 'FAILED' ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${job.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-500 mt-1 block text-right">{job.progress}%</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {job.youtubeVideoId ? (
                                                    <a
                                                        href={`https://youtu.be/${job.youtubeVideoId}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                                                    >
                                                        <Youtube className="w-4 h-4" />
                                                        View
                                                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2 whitespace-nowrap">
                                                <Clock className="w-3 h-3" />
                                                {new Date(job.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <ScheduleUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={() => {
                        // Refresh jobs after a short delay to allow sync to catch up
                        setTimeout(fetchData, 3000);
                    }}
                />
            </div>
        </div>
    );
};

export default ChannelsPage;
