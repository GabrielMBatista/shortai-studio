import React from 'react';
import { X } from 'lucide-react';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
};

export function SidePanel({
    isOpen,
    onClose,
    title,
    subtitle,
    icon: Icon,
    children,
    width = 'lg'
}: SidePanelProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 bottom-0 ${widthClasses[width]} w-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl z-50 animate-slide-in-right overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-5 border-b border-slate-700/50 bg-slate-800/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {Icon && (
                                <div className="p-2.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20 flex-shrink-0">
                                    <Icon className="w-5 h-5 text-indigo-400" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-white truncate">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-sm text-slate-400 mt-1">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white flex-shrink-0 ml-3"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
}

// Subcomponent for consistent sections
export function SidePanelSection({
    title,
    children,
    className = ''
}: {
    title?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`p-6 ${className}`}>
            {title && (
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}
