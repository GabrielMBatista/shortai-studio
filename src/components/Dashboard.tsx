import React, { useState, useMemo, useEffect } from 'react';
import { User, VideoProject, Folder as FolderType } from '../types';
import { Plus, Clock, Film, Play, Trash2, Zap, Sparkles, ArrowRight, Archive, Download, Filter, MoreVertical, FolderInput, Folder } from 'lucide-react';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';
import FolderList from './FolderList';
import { exportProjectContext, patchProjectMetadata, getFolders } from '../services/storageService';

interface DashboardProps {
    user: User;
    projects: VideoProject[];
    onNewProject: () => void;
    onOpenProject: (project: VideoProject) => void;
    onDeleteProject: (projectId: string) => void;
    onRefreshProjects: () => void;
    isLoading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, projects, onNewProject, onOpenProject, onDeleteProject, onRefreshProjects, isLoading = false }) => {
    const { t } = useTranslation();
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [filterTag, setFilterTag] = useState('');
    const [folders, setFolders] = useState<FolderType[]>([]);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, projectId: string } | null>(null);

    useEffect(() => {
        getFolders().then(setFolders);
    }, []);

    const handleRefreshFolders = () => {
        getFolders().then(setFolders);
    };

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            if (showArchived) {
                return p.isArchived;
            }
            if (p.isArchived) return false; // Hide archived by default

            if (selectedFolderId && p.folderId !== selectedFolderId) return false;
            if (filterTag && !p.tags?.some(t => t.toLowerCase().includes(filterTag.toLowerCase()))) return false;

            return true;
        });
    }, [projects, selectedFolderId, showArchived, filterTag]);

    const handleExportContext = async () => {
        try {
            const data = await exportProjectContext(selectedFolderId || undefined, filterTag || undefined);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `context-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export context");
        }
    };

    const handleArchive = async (projectId: string, currentStatus: boolean) => {
        try {
            await patchProjectMetadata(projectId, { is_archived: !currentStatus });
            setContextMenu(null);
            onRefreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    const handleMoveToFolder = async (projectId: string, folderId: string | null) => {
        try {
            await patchProjectMetadata(projectId, { folder_id: folderId });
            setContextMenu(null);
            onRefreshProjects();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)]" onClick={() => setContextMenu(null)}>
            {/* Sidebar */}
            <FolderList
                selectedFolderId={selectedFolderId}
                onSelectFolder={setSelectedFolderId}
                onFoldersChange={handleRefreshFolders}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-[#0f172a] relative">
                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 w-48"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => {
                                const p = projects.find(p => p.id === contextMenu.projectId);
                                if (p) handleArchive(p.id, !!p.isArchived);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            <Archive className="w-4 h-4" />
                            {projects.find(p => p.id === contextMenu.projectId)?.isArchived ? 'Unarchive' : 'Archive'}
                        </button>

                        <div className="border-t border-slate-700 my-1" />
                        <div className="px-3 py-1 text-xs text-slate-500 font-semibold uppercase">Move to Folder</div>

                        <button
                            onClick={() => handleMoveToFolder(contextMenu.projectId, null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            <FolderInput className="w-4 h-4" />
                            All Projects (Root)
                        </button>

                        {folders.map(f => (
                            <button
                                key={f.id}
                                onClick={() => handleMoveToFolder(contextMenu.projectId, f.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white truncate"
                            >
                                <Folder className="w-4 h-4" />
                                {f.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in-up">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                {t('dashboard.hello', { name: user.name.split(' ')[0] })} <span className="animate-pulse">👋</span>
                            </h1>
                            <p className="text-slate-400 text-lg">{t('dashboard.subtitle')}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleExportContext}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                                title="Export context for AI reference"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export Context</span>
                            </button>

                            <button
                                onClick={onNewProject}
                                className="group relative inline-flex items-center justify-center px-6 py-2 font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                            >
                                <Sparkles className="w-5 h-5 mr-2 text-indigo-200 group-hover:text-white transition-colors" />
                                <span>{t('dashboard.create_magic')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex items-center gap-4 mb-6 bg-slate-800/30 p-2 rounded-lg border border-slate-700/50">
                        <div className="flex items-center gap-2 text-slate-400 px-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        <input
                            type="text"
                            placeholder="Filter by tag..."
                            value={filterTag}
                            onChange={(e) => setFilterTag(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />

                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${showArchived ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Archive className="w-4 h-4" />
                            {showArchived ? 'Showing Archived' : 'Show Archived'}
                        </button>

                        <div className="ml-auto text-sm text-slate-500">
                            {isLoading ? t('dashboard.syncing') : t('dashboard.projects_count_plural', { count: filteredProjects.length })}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="w-full h-64 flex items-center justify-center bg-slate-800/30 rounded-3xl border border-slate-700/50">
                            <Loader text={t('dashboard.loading_projects')} />
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="relative overflow-hidden bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700/50 p-12 text-center group hover:border-indigo-500/30 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-slate-800 group-hover:scale-110 transition-transform duration-300">
                                    <Film className="w-10 h-10 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{t('dashboard.no_projects_title')}</h3>
                                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                    {t('dashboard.no_projects_desc')}
                                </p>
                                <button onClick={onNewProject} className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline flex items-center justify-center gap-2 mx-auto">
                                    <Plus className="w-4 h-4" /> {t('dashboard.start_project')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => {
                                const completedImages = project.scenes.filter(s => s.imageStatus === 'completed').length;
                                const completedAudio = project.scenes.filter(s => s.audioStatus === 'completed').length;
                                const totalTasks = (project.scenes.length || 6) * 2; // Images + Audio
                                const progress = totalTasks > 0 ? Math.round(((completedImages + completedAudio) / totalTasks) * 100) : 0;

                                // Prefer the generated title (clean) over the raw topic (which might be a JSON blob)
                                let displayTitle = project.generatedTitle || project.topic;

                                // Fallback: If title still looks like JSON (recovery failed or not happened yet), try to clean it for UI
                                if (typeof displayTitle === 'string' && (displayTitle.trim().startsWith('{') || displayTitle.trim().startsWith('['))) {
                                    try {
                                        const p = JSON.parse(displayTitle);
                                        displayTitle = p.projectTitle || p.videoTitle || p.title || p.scriptTitle || "Untitled Project";
                                    } catch (e) { }
                                }

                                return (
                                    <div
                                        key={project.id}
                                        onClick={() => onOpenProject(project)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setContextMenu({ x: e.clientX, y: e.clientY, projectId: project.id });
                                        }}
                                        className="group bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col h-full relative"
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                            {project.scenes[0]?.imageUrl ? (
                                                <img
                                                    src={project.scenes[0].imageUrl}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-800/80">
                                                    <Zap className="w-12 h-12 text-slate-700 group-hover:text-indigo-500/50 transition-colors" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                                            <div className="absolute top-3 right-3 flex gap-2">
                                                <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                                                    {project.language}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, projectId: project.id }); }}
                                                className="absolute top-3 left-3 p-2 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-800 transition-all transform hover:scale-110 backdrop-blur-sm shadow-lg"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {/* Play Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                                    <Play className="w-6 h-6 text-white fill-current" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="mb-3">
                                                <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-indigo-300 transition-colors" title={displayTitle}>
                                                    {displayTitle}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    <span className="bg-slate-700/50 px-2 py-0.5 rounded border border-slate-700">{project.style}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(project.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-slate-700/50">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-xs font-semibold text-slate-400">{t('dashboard.progress')}</span>
                                                    <span className="text-xs font-bold text-indigo-400">{progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-700/50 rounded-full w-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
