import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Youtube, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ChannelsPage: React.FC = () => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    // Mock Data
    const channels = [
        { id: '1', name: 'Tech Shorts Daily', email: 'gabriel@techshorts.com', status: 'active', lastSync: Date.now() },
    ];

    const jobs = [
        { id: '1', fileName: 'MyVideo.mp4', status: 'completed', progress: 100, youtubeId: 'AbCk123', date: Date.now() - 100000 },
        { id: '2', fileName: 'Tutorial.mp4', status: 'processing', progress: 45, youtubeId: null, date: Date.now() },
    ];

    return (
        <div className="flex-1 bg-[#0f172a] p-8 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('channels.title', 'Channel Manager')}</h1>
                        <p className="text-slate-400">{t('channels.subtitle', 'Automate your uploads from Drive to YouTube')}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors">
                        <Plus className="w-5 h-5" />
                        {t('channels.connect_new', 'Connect Channel')}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-lg">
                                <Youtube className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Connected Channels</p>
                                <p className="text-2xl font-bold text-white">{channels.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <RefreshCw className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Active Syncs</p>
                                <p className="text-2xl font-bold text-white">1</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Uploads Today</p>
                                <p className="text-2xl font-bold text-white">5</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Recent Activity</h3>
                        <button className="text-sm text-slate-400 hover:text-white">View All</button>
                    </div>
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-slate-300 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">File Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Progress</th>
                                <th className="px-6 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{job.fileName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                                job.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-slate-700 text-slate-400'
                                            }`}>
                                            {job.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full max-w-[100px] bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${job.progress}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {new Date(job.date).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ChannelsPage;
