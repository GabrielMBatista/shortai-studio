import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Youtube, RefreshCw, Clock, X, BarChart2, ThumbsUp, MessageCircle, Eye, Calendar, Tag, Sparkles } from 'lucide-react';
import ChannelPersonaSelector from './ChannelPersonaSelector';
import { Channel } from '../types/personas'; // Usando o tipo global correto

// Manter VideoAnalytics local pois é específico dessa view por enquanto
interface VideoAnalytics {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnail: string;
    tags: string[];
    duration: string;
    stats: {
        views: number;
        likes: number;
        comments: number;
    };
    url: string;
}

const ChannelVideosModal = ({
    isOpen,
    onClose,
    channelName,
    videos,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    channelName: string;
    videos: VideoAnalytics[];
    isLoading: boolean;
}) => {
    if (!isOpen) return null;

    const formatDuration = (iso: string) => {
        if (!iso) return '00:00';
        const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return iso;
        const h = (match[1] || '').replace('H', '');
        const m = (match[2] || '').replace('M', '');
        const s = (match[3] || '').replace('S', '');
        const hStr = h ? `${h.padStart(2, '0')}:` : '';
        const mStr = m ? `${m.padStart(2, '0')}:` : '00:';
        const sStr = s ? s.padStart(2, '0') : '00';
        return `${hStr}${mStr}${sStr}`;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-indigo-400" />
                            Analytics: {channelName}
                        </h2>
                        <p className="text-sm text-slate-400">Last 20 uploaded videos performance</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                            <p>Analyzing channel videos...</p>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center text-slate-500 py-12">No videos found for this channel.</div>
                    ) : (
                        <div className="space-y-4">
                            {videos.map((video) => (
                                <div key={video.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:bg-slate-800/60 transition-colors group">
                                    <div className="relative shrink-0 w-full md:w-48 aspect-video rounded-lg overflow-hidden bg-slate-900">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                                            {formatDuration(video.duration)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <a href={video.url} target="_blank" rel="noreferrer" className="block">
                                            <h3 className="text-white font-semibold truncate group-hover:text-indigo-400 transition-colors" title={video.title}>
                                                {video.title}
                                            </h3>
                                        </a>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-3">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(video.publishedAt).toLocaleDateString()}
                                            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                            {new Date(video.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 max-w-sm mb-3">
                                            <div className="flex items-center gap-2" title="Views">
                                                <Eye className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm font-medium text-slate-200">{formatNumber(video.stats.views)}</span>
                                            </div>
                                            <div className="flex items-center gap-2" title="Likes">
                                                <ThumbsUp className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm font-medium text-slate-200">{formatNumber(video.stats.likes)}</span>
                                            </div>
                                            <div className="flex items-center gap-2" title="Comments">
                                                <MessageCircle className="w-4 h-4 text-purple-400" />
                                                <span className="text-sm font-medium text-slate-200">{formatNumber(video.stats.comments)}</span>
                                            </div>
                                        </div>
                                        {video.tags && video.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-auto">
                                                {video.tags.slice(0, 5).map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full border border-slate-700">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChannelsPage: React.FC = () => {
    const { t } = useTranslation();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedChannel, setSelectedChannel] = useState<{ id: string, name: string, youtubeChannelId: string } | null>(null);
    const [channelVideos, setChannelVideos] = useState<VideoAnalytics[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    const fetchData = async () => {
        try {
            // USAR A NOVA ROTA QUE RETORNA CANAIS COM PERSONA
            const res = await fetch(`${apiUrl}/channels/user`);
            if (res.ok) {
                const data = await res.json();
                setChannels(data.channels || []);
            }
        } catch (error) {
            console.error("Failed to fetch channel data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchChannelVideos = async (channelId: string, youtubeChannelId: string, name: string) => {
        // Encontra o accountId do canal atual
        const channel = channels.find(c => c.id === channelId);
        // Fallback se não tiver no objeto channel (o modelo novo usa youtubeChannelId, e accountId está na relação)
        // Para simplificar e manter compatibilidade, assumimos que youtubeChannelId é suficiente para futuras chamadas ou
        // pegamos de channel.userId? Não, precisamos do accountId.
        // O endpoint novo /channels/user NÃO retorna accountId direto na raiz do objeto Channel do tipo PersonasChannel.
        // Vamos precisar ajustar ou buscar o accountId.
        // O endpoint antigo /api/channels retornava { accountId, ... }.
        // O endpoint novo retorna Channel do Prisma que tem relation googleAccountId.
        // Vamos usar googleAccountId se disponível.

        // CORREÇÃO: O type Channel em 'types/personas.ts' não tem accountId explícito na interface, mas vamos assumir que vem no JSON se incluirmos no backend,
        // ou usamos o ID do canal para buscar analíticas. O endpoint de videos espera accountId na query.
        // Vamos ter que usar endpoint antigo para video analytics OU adaptar.
        // POR ENQUANTO: Vamos tentar usar channel.userId ou desabilitar analytics temporariamente se faltar dados.

        // WORKAROUND: O endpoint /channels/user do novo backend já deve retornar tudo que precisamos.
        // Se faltar accountId, vamos re-fetch da rota antiga apenas para analytics ou assumir que o backend resolve.

        // Idealmente, criar endpoint novo para analytics também.
        // Por hora, vou comentar a chamada de analytics se faltar accountId para evitar erro, 
        // mas vamos tentar passar o que tiver.

        setSelectedChannel({ id: channelId, youtubeChannelId, name });
        setIsLoadingVideos(true);

        // Temporário: usar endpoint antigo mas precisamos de accountId.
        // O novo backend Channel tem googleAccountId. Vamos usar esse como accountId.
        // @ts-ignore
        const accId = channel?.googleAccountId || channel?.accountId;

        if (!accId) {
            console.error("Missing accountId for video analytics");
            setIsLoadingVideos(false);
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/channels/${channelId}/videos?accountId=${accId}`);
            if (res.ok) {
                const data = await res.json();
                setChannelVideos(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingVideos(false);
        }
    };

    const handleConnect = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${apiUrl}/auth/signin/google`;
        const callbackInput = document.createElement('input');
        callbackInput.type = 'hidden';
        callbackInput.name = 'callbackUrl';
        callbackInput.value = window.location.origin;
        form.appendChild(callbackInput);
        document.body.appendChild(form);
        form.submit();
    };

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const handleChannelUpdate = (updatedChannel: Channel) => {
        setChannels(prev => prev.map(c => c.id === updatedChannel.id ? updatedChannel : c));
    };

    return (
        <div className="flex-1 bg-[#0f172a] p-4 md:p-8 min-h-screen animate-fade-in relative">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('channels.title', 'Channel Manager')}</h1>
                        <p className="text-slate-400">{t('channels.subtitle', 'Manage connected channels & AI personas')}</p>
                    </div>
                    <button
                        onClick={handleConnect}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-red-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        {t('channels.connect_new', 'Connect Channel')}
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                        <p>Loading channels...</p>
                    </div>
                ) : channels.length === 0 ? (
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center border-dashed">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Youtube className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Channels Connected</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-8">
                            Connect your Google account to import your YouTube channels.
                        </p>
                        <button
                            onClick={handleConnect}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Connect Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {channels.map((channel) => (
                            <div key={channel.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800 transition-all group flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        {channel.thumbnail ? (
                                            <img src={channel.thumbnail} alt={channel.name} className="w-12 h-12 rounded-full border-2 border-slate-700" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                                <Youtube className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="text-white font-bold truncate max-w-[150px]">{channel.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                <Youtube className="w-3 h-3 text-red-500" />
                                                YouTube
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${channel.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-600'}`}></div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-700/50 mb-4 bg-slate-900/30 -mx-6 px-6">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{formatNumber(channel.subscriberCount)}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Subs</p>
                                    </div>
                                    <div className="text-center border-l border-slate-700/50">
                                        <p className="text-lg font-bold text-white">{channel.videoCount || 0}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Videos</p>
                                    </div>
                                    <div className="text-center border-l border-slate-700/50">
                                        <p className="text-lg font-bold text-white">{formatNumber(Number(channel.viewCount || 0))}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Views</p>
                                    </div>
                                </div>

                                {/* Persona Selector - NEW FEATURE */}
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-indigo-400" />
                                        AI Persona
                                    </label>
                                    <ChannelPersonaSelector
                                        channel={channel}
                                        onUpdate={handleChannelUpdate}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => fetchChannelVideos(channel.id, channel.youtubeChannelId, channel.name)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700/30 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <BarChart2 className="w-3.5 h-3.5" />
                                        Analytics
                                    </button>
                                </div>

                                <div className="mt-3 text-[10px] text-center text-slate-600">
                                    Last synced: {channel.lastSyncedAt ? new Date(channel.lastSyncedAt).toLocaleDateString() : 'Never'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
            </div>
        </div>
    );
};

export default ChannelsPage;
