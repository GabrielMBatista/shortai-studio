import React from 'react';
import { Youtube, Sparkles, CheckCircle2, ChevronDown, UserCircle2 } from 'lucide-react';
import { Channel, Persona, PersonaBasic } from '../../types/personas';

interface ChannelPersonaSelectorProps {
    channels: Channel[];
    personas?: Persona[]; // Optional for backward compatibility, but required for feature
    selectedChannelId: string | null;
    selectedPersonaId?: string | null;
    onChannelSelect: (channelId: string | null) => void;
    onPersonaSelect?: (personaId: string | null) => void;
    disabled?: boolean;
}

export const ChannelPersonaSelector: React.FC<ChannelPersonaSelectorProps> = ({
    channels,
    personas = [],
    selectedChannelId,
    selectedPersonaId,
    onChannelSelect,
    onPersonaSelect,
    disabled = false
}) => {
    const selectedChannel = channels.find(ch => ch.id === selectedChannelId);
    const selectedPersona = personas.find(p => p.id === selectedPersonaId);

    // Effective Persona: Channel's persona overrides manual selection if channel is active
    const activePersona = selectedChannel?.persona || selectedPersona;

    return (
        <div className="space-y-4">
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
                                {channel.name} {channel.persona ? `(Masked by ${channel.persona.name})` : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                </div>
            </div>

            {/* Persona Selector (Only if No Channel or Channel has no Persona? - No, only if No Channel for now to keep it simple, or if Channel allows override? Let's stick to: If Channel selected, it drives. If not, you pick.) */}
            {!selectedChannel && onPersonaSelect && (
                <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                        <UserCircle2 className="w-3 h-3" />
                        Persona (Optional)
                    </label>
                    <div className="relative">
                        <select
                            value={selectedPersonaId || ''}
                            onChange={(e) => onPersonaSelect(e.target.value || null)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer hover:border-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={disabled}
                        >
                            <option value="">No Persona (Generic Style)</option>
                            {personas.map(persona => (
                                <option key={persona.id} value={persona.id}>
                                    {persona.name} {persona.category ? `(${persona.category})` : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Active Persona Context Info */}
            {activePersona && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <div className="flex-1">
                            <div className="text-xs font-semibold text-indigo-300">
                                {selectedChannel?.persona ? "Channel Persona Active" : "Selected Persona Active"}
                            </div>
                            <div className="text-sm text-white font-medium">{activePersona.name}</div>
                        </div>
                    </div>
                    {(activePersona as any).description && (
                        <div className="text-xs text-slate-400 line-clamp-2">
                            {(activePersona as any).description}
                        </div>
                    )}
                </div>
            )}

            {/* Anti-Repetition Info */}
            {selectedChannel && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div className="flex-1">
                        <div className="text-xs font-semibold text-emerald-300">Anti-Repetition ON</div>
                        <div className="text-xs text-slate-400">
                            Using context from {selectedChannel.videoCount || 0} existing videos
                        </div>
                    </div>
                </div>
            )}

            {/* No Context Warning */}
            {!selectedChannel && !activePersona && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                        💡 <strong>Tip:</strong> Select a channel or persona to guide the AI generation style.
                    </div>
                </div>
            )}
        </div>
    );
};
