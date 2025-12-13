import React, { useState, useMemo } from 'react';
import { Persona } from '../types/personas';
import { usePersonas } from '../hooks/usePersonas';
import { Sparkles, Crown, Star, Filter, MessageCircle } from 'lucide-react';
import PersonaChatModal from './PersonaChatModal';

export default function PersonaGallery() {
    const { personas, loading, error } = usePersonas();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [chatPersona, setChatPersona] = useState<Persona | null>(null);

    const categories = useMemo(() => {
        const cats = new Set(personas.map(p => p.category).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [personas]);

    const filteredPersonas = useMemo(() => {
        if (selectedCategory === 'all') return personas;
        return personas.filter(p => p.category === selectedCategory);
    }, [personas, selectedCategory]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading personas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
                <p className="text-red-400 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                        Persona Library
                    </h2>
                    <p className="text-slate-400 mt-1">Choose your AI scriptwriter style or chat with them directly</p>
                </div>
                <div className="text-sm text-slate-500">
                    {filteredPersonas.length} persona{filteredPersonas.length !== 1 ? 's' : ''} available
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-slate-500" />
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredPersonas.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    No personas found for this category
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPersonas.map(persona => (
                        <PersonaCard
                            key={persona.id}
                            persona={persona}
                            onChat={() => setChatPersona(persona)}
                        />
                    ))}
                </div>
            )}

            {/* Chat Modal */}
            <PersonaChatModal
                isOpen={!!chatPersona}
                onClose={() => setChatPersona(null)}
                persona={chatPersona}
            />
        </div>
    );
}

function PersonaCard({ persona, onChat }: { persona: Persona, onChat: () => void }) {
    const getBadges = () => {
        const badges = [];
        if (persona.isOfficial) badges.push({ icon: Star, text: 'Official', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' });
        if (persona.isFeatured) badges.push({ icon: Sparkles, text: 'Featured', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' });
        if (persona.isPremium) badges.push({ icon: Crown, text: 'Premium', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' });
        return badges;
    };

    const badges = getBadges();

    // Generate color from name for avatar
    const getInitials = (name: string) => {
        return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-gradient-to-br from-indigo-500 to-purple-500',
            'bg-gradient-to-br from-emerald-500 to-cyan-500',
            'bg-gradient-to-br from-amber-500 to-orange-500',
            'bg-gradient-to-br from-pink-500 to-rose-500',
            'bg-gradient-to-br from-blue-500 to-indigo-500',
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    return (
        <div className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10">
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative p-6 flex flex-col h-full">
                {/* Header with Avatar */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-xl ${getAvatarColor(persona.name)} flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0 ring-2 ring-white/10`}>
                        {getInitials(persona.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-1 truncate">
                            {persona.name}
                        </h3>
                        {persona.category && (
                            <span className="inline-block px-2.5 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg font-medium">
                                {persona.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Badges */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {badges.map((badge, i) => (
                            <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${badge.color}`}>
                                <badge.icon className="w-3.5 h-3.5" />
                                <span>{badge.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="flex-1 mb-4">
                    {persona.description && (
                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                            {persona.description}
                        </p>
                    )}
                </div>

                {/* Tags */}
                {persona.tags && persona.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {persona.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-900/50 text-slate-500 text-[11px] rounded-md font-mono">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Stats & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className="font-medium text-slate-400">{persona.usageCount}</span> uses
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <span className="font-mono text-slate-400">{persona.temperature}</span> temp
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onChat(); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-105"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </button>
                </div>
            </div>
        </div>
    );
}
