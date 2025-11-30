
import React, { useState, useRef, useEffect } from 'react';
import { VIDEO_STYLES, AVAILABLE_VOICES, AVAILABLE_LANGUAGES, TTSProvider, Voice, IS_SUNO_ENABLED, User } from '../types';
import { Sparkles, ArrowRight, Mic, Play, Square, Loader2, ChevronDown, Music, Zap, Image as ImageIcon, LayoutTemplate, Plus, User as UserIcon, Trash2, CheckCircle2, X, Upload, Wand2, Clock, Layers, Palette, Film, Paintbrush, Box, MonitorPlay } from 'lucide-react';
import { generatePreviewAudio, analyzeCharacterFeatures, getVoices } from '../services/geminiService';
import { useCharacterLibrary } from '../hooks/useCharacterLibrary';
import Loader from './Loader';
import { ToastType } from './Toast';
import ConfirmModal from './ConfirmModal';

const VoicePreviewButton = ({ voice, provider, voices }: { voice: string, provider: TTSProvider, voices: Voice[] }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing'>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlay = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (status === 'playing') {
            audioRef.current?.pause();
            setStatus('idle');
            return;
        }

        setStatus('loading');
        try {
            const vObj = voices.find(v => v.name === voice);
            if (!vObj) throw new Error("Voice not found");

            let url = vObj.previewUrl;
            if (!url) {
                // Use backend to generate preview if no static preview url
                url = await generatePreviewAudio(`Hello! I am ${vObj.label}.`, vObj.name, provider);
            }

            if (!url) throw new Error("No preview");

            const audio = new Audio(url);
            audioRef.current = audio;
            audio.onended = () => setStatus('idle');
            await audio.play();
            setStatus('playing');
        } catch (e) {
            console.error(e);
            setStatus('idle');
        }
    };

    return (
        <button type="button" onClick={handlePlay} className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-700/50 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-all border border-slate-600 hover:border-indigo-500">
            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : status === 'playing' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>
    );
};

// Icon map for styles
const getStyleIcon = (style: string) => {
    const s = style.toLowerCase();
    if (s.includes('cinematic')) return Film;
    if (s.includes('3d')) return Box;
    if (s.includes('painting') || s.includes('watercolor')) return Palette;
    if (s.includes('anime')) return Sparkles;
    if (s.includes('vector') || s.includes('minimalist')) return Paintbrush;
    if (s.includes('cyberpunk')) return Zap;
    return MonitorPlay;
};

// Moved outside to prevent re-creation on render
const SectionTitle = ({ icon: Icon, title, subtitle }: any) => (
    <div className="mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Icon className="w-4 h-4 text-indigo-400" />
            </div>
            {title}
        </h3>
        {subtitle && <p className="text-sm text-slate-500 ml-9">{subtitle}</p>}
    </div>
);

interface InputSectionProps {
    user: User | null;
    onGenerate: (
        topic: string,
        style: string,
        voice: string,
        provider: TTSProvider,
        language: string,
        refs: any[],
        includeMusic: boolean,
        durationConfig: { min: number, max: number, targetScenes?: number }
    ) => Promise<void>; // Make this return a Promise
    isLoading: boolean;
    loadingMessage?: string;
    showToast: (message: string, type: ToastType) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ user, onGenerate, isLoading, loadingMessage, showToast }) => {
    const { characters, addCharacter, removeCharacter, isLoading: isCharLoading } = useCharacterLibrary(user);

    // Local Loading State for "Create Project" button
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState(VIDEO_STYLES[0]);
    const [language, setLanguage] = useState(AVAILABLE_LANGUAGES[0].label);

    // Duration & Scene Config
    const [minDuration, setMinDuration] = useState<number | ''>(60);
    const [maxDuration, setMaxDuration] = useState<number | ''>(70);
    const [targetScenes, setTargetScenes] = useState<string>("");

    // TTS State
    const [ttsProvider, setTtsProvider] = useState<TTSProvider>('gemini');
    const [voice, setVoice] = useState('');
    const [dynamicVoices, setDynamicVoices] = useState<Voice[]>(AVAILABLE_VOICES);

    // Filter voices based on language
    const filteredVoices = dynamicVoices.filter(v => {
        if (!language) return true;
        const langObj = AVAILABLE_LANGUAGES.find(l => l.label === language);
        if (!langObj) return true;

        if (v.supportedLanguages && v.supportedLanguages.length > 0) {
            return v.supportedLanguages.includes(langObj.code) || v.supportedLanguages.includes('multilingual');
        }
        return true;
    });

    {
        IS_SUNO_ENABLED && (
            <div
                onClick={() => !isBusy && setIncludeMusic(!includeMusic)}
                className={`mt-auto relative overflow-hidden p-5 rounded-2xl border cursor-pointer flex items-center gap-4 transition-all duration-300 group ${includeMusic ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-pink-500/50' : 'bg-slate-900 border-slate-700 hover:border-pink-500/30'
                    } ${isBusy ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <div className={`p-3 rounded-full transition-colors ${includeMusic ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-pink-400'}`}>
                    <Music className="w-6 h-6" />
                </div>
                <div className="flex-1 z-10">
                    <h4 className={`font-bold text-base ${includeMusic ? 'text-pink-100' : 'text-slate-300'}`}>Background Music</h4>
                    <p className="text-xs text-slate-500 mt-1">AI Generated soundtrack (Instrumental)</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${includeMusic ? 'bg-pink-500 border-pink-500' : 'border-slate-600'}`}>
                    {includeMusic && <Zap className="w-3 h-3 text-white" />}
                </div>
            </div>
        )
    }
                    </div >
                </div >

    <div className="lg:col-span-12 mt-4 pb-12">
        <button
            type="submit"
            disabled={!topic.trim() || isBusy}
            className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-200 hover:bg-pos-100 text-white text-xl font-bold py-6 rounded-2xl shadow-2xl shadow-indigo-900/40 flex items-center justify-center gap-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transform"
            style={{ backgroundSize: '200% auto' }}
        >
            {isBusy ? (
                <div className="flex items-center gap-4 py-2">
                    <Loader size="sm" />
                    <span className="animate-pulse">{isSubmitting ? "Generating Script & Scenes..." : (loadingMessage || "Processing...")}</span>
                </div>
            ) : (
                <>
                    <Sparkles className="w-7 h-7 text-indigo-200 group-hover:text-white transition-colors" />
                    <span>Generate Video Workflow</span>
                    <ArrowRight className="w-7 h-7 opacity-60 group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
        <p className="text-center text-slate-500 text-xs mt-4">
            Generates a detailed storyboard, script, and audio assets. <br />
            <span className="text-indigo-400 font-semibold">Daily Limit: 1 Video for Free Plan</span>
        </p>
    </div>
            </form >
        </div >
    );
};

export default InputSection;
