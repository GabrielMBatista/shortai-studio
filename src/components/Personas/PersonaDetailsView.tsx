import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Loader2, Trash2, Sparkles, Crown, Star, Gauge, Thermometer, MessageSquare } from 'lucide-react';
import { Persona } from '../../types/personas';
import { personasApi } from '../../api/personas';
import { Card, Button, Badge } from '../ui';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface PersonaDetailsViewProps {
    persona: Persona;
    onCreateProject?: () => void;
}

export function PersonaDetailsView({ persona, onCreateProject }: PersonaDetailsViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Reset messages when persona changes
    useEffect(() => {
        setMessages([]);
    }, [persona.id]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await personasApi.chat(persona.id, userMsg, history);
            setMessages(prev => [...prev, { role: 'model', text: res.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        if (window.confirm('Clear chat history?')) {
            setMessages([]);
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'from-indigo-500 to-purple-500',
            'from-emerald-500 to-cyan-500',
            'from-amber-500 to-orange-500',
            'from-pink-500 to-rose-500',
            'from-blue-500 to-indigo-500',
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    return (
        <div className="space-y-6">
            {/* Persona Info Header */}
            <Card variant="glass" padding="lg">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(persona.name)} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0 ring-2 ring-white/10`}>
                        {getInitials(persona.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{persona.name}</h2>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {persona.category && <Badge variant="default" size="sm">{persona.category}</Badge>}
                                    {persona.isOfficial && (
                                        <Badge variant="primary" size="sm">
                                            <Star className="w-3 h-3" /> Official
                                        </Badge>
                                    )}
                                    {persona.isFeatured && (
                                        <Badge variant="success" size="sm">
                                            <Sparkles className="w-3 h-3" /> Featured
                                        </Badge>
                                    )}
                                    {persona.isPremium && (
                                        <Badge variant="warning" size="sm">
                                            <Crown className="w-3 h-3" /> Premium
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {persona.description && (
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                {persona.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-xs">
                            <div className="flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-indigo-400" />
                                <span className="text-slate-500">Temperature:</span>
                                <span className="text-white font-mono">{persona.temperature}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-emerald-400" />
                                <span className="text-slate-500">Uses:</span>
                                <span className="text-white font-medium">{persona.usageCount || 0}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {persona.tags && persona.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                {persona.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-slate-900/50 text-slate-500 text-[11px] rounded-md font-mono">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        {onCreateProject && (
                            <div className="mt-6 pt-4 border-t border-white/10">
                                <Button
                                    variant="primary"
                                    leftIcon={<Sparkles className="w-4 h-4" />}
                                    onClick={onCreateProject}
                                >
                                    Create Project with this Persona
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Chat Interface */}
            <Card variant="glass" padding="none" className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold text-white">Chat with {persona.name}</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={messages.length === 0}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        Clear
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30 scrollbar-thin scrollbar-thumb-slate-700">
                    {messages.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Start a conversation with {persona.name}!</p>
                            <p className="text-xs opacity-70 mt-1">Ask for script ideas, content planning, or just chat.</p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                                }`}>
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-800">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Message ${persona.name}...`}
                            className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={!input.trim() || isLoading}
                            isLoading={isLoading}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
