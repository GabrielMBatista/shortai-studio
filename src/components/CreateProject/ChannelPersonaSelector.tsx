import React from 'react';
import { Youtube, Sparkles, CheckCircle2, UserCircle2 } from 'lucide-react';
import { Channel, Persona } from '../../types/personas';
import { Select } from '../ui/Select';

interface ChannelPersonaSelectorProps {
    channels: Channel[];
    personas?: Persona[];
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
    const activePersona = selectedChannel?.persona || selectedPersona;

    return (
        <div className="space-y-4">
            {/* Channel Selector */}
            <Select
                label="Channel (Recommended)"
                leftIcon={<Youtube className="w-4 h-4" />}
                value={selectedChannelId || ''}
                onChange={(e) => onChannelSelect(e.target.value || null)}
                disabled={disabled}
            >
                <option value="">No Channel (Independent Project)</option>
                {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                        {channel.name} {channel.persona ? `(Masked by ${channel.persona.name})` : ''}
                    </option>
                ))}
            </Select>

            {/* Persona Selector */}
            {!selectedChannel && onPersonaSelect && (
                <div className="animate-fade-in">
                    <Select
                        label="Persona (Optional)"
                        leftIcon={<UserCircle2 className="w-4 h-4" />}
                        value={selectedPersonaId || ''}
                        onChange={(e) => onPersonaSelect(e.target.value || null)}
                        disabled={disabled}
                    >
                        <option value="">No Persona (Generic Style)</option>
                        {personas.map(persona => (
                            <option key={persona.id} value={persona.id}>
                                {persona.name} {persona.category ? `(${persona.category})` : ''}
                            </option>
                        ))}
                    </Select>
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
