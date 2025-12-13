import React from 'react';
import { Youtube, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { Channel } from '../../types/personas';

interface ChannelPersonaSelectorProps {
    channels: Channel[];
    selectedChannelId: string | null;
    onChannelSelect: (channelId: string | null) => void;
    disabled?: boolean;
}

export const ChannelPersonaSelector: React.FC<ChannelPersonaSelectorProps> = ({
    channels,
    selectedChannelId,
    onChannelSelect,
    disabled = false
}) => {
    const selectedChannel = channels.find(ch => ch.id === selectedChannelId);

    return (
        <div className="space-y-3">
            {/* Channel Selector */}
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    Channel (Recommended)
                </label>
                <div className="relative">
                    <select
                        value={selectedChannelId || ''}
                        onChange={(e) => onChannelSelect(e.target.value || null)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={disabled}
                    >
                        <option value="">No Channel (Independent Project)</option>
                        {channels.map(channel => (
                            <option key={channel.id} value={channel.id}>
                                {channel.name} {channel.persona ? `(🎭 ${channel.persona.name})` : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                </div>
            </div>

            {/* Persona & Anti-Repetition Info */}
            {selectedChannel && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 space-y-2">
                    {/* Persona Badge */}
                    {selectedChannel.persona && (
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <div className="flex-1">
                                <div className="text-xs font-semibold text-indigo-300">AI Persona Active</div>
                                <div className="text-sm text-white font-medium">{selectedChannel.persona.name}</div>
                            </div>
                        </div>
                    )}

                    {/* Anti-Repetition Badge */}
                    <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-emerald-300">Anti-Repetition ON</div>
                            <div className="text-xs text-slate-400">
                                Analyzing {selectedChannel.videoCount || 0} existing videos to avoid repetition
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Channel Info */}
            {!selectedChannel && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                        💡 <strong>Tip:</strong> Select a channel to enable anti-repetition and use channel's AI persona
                    </div>
                </div>
            )}
        </div>
    );
};
