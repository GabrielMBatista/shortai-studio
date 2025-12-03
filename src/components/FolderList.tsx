import React, { useState, useEffect } from 'react';
import { Folder, Plus, MoreVertical, Edit2, Trash2, FolderOpen } from 'lucide-react';
import { Folder as FolderType } from '../types';
import { createFolder, updateFolder, deleteFolder, getFolders } from '../services/storageService';

interface FolderListProps {
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onFoldersChange?: () => void; // Trigger refresh of projects
}

const FolderList: React.FC<FolderListProps> = ({ selectedFolderId, onSelectFolder, onFoldersChange }) => {
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const fetchFolders = async () => {
        const data = await getFolders();
        setFolders(data);
    };

    useEffect(() => {
        fetchFolders();
    }, []);

    const handleCreate = async () => {
        if (!newFolderName.trim()) return;
        try {
            await createFolder(newFolderName);
            setNewFolderName('');
            setIsCreating(false);
            fetchFolders();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        try {
            await updateFolder(id, editName);
            setEditingFolderId(null);
            setMenuOpenId(null);
            fetchFolders();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this folder? Projects will be moved to "All Projects".')) return;
        try {
            await deleteFolder(id);
            if (selectedFolderId === id) onSelectFolder(null);
            setMenuOpenId(null);
            fetchFolders();
            onFoldersChange?.();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col gap-2 h-full">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Folders</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <button
                onClick={() => onSelectFolder(null)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${selectedFolderId === null
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
            >
                <FolderOpen className="w-4 h-4" />
                All Projects
            </button>

            {isCreating && (
                <div className="flex items-center gap-2 px-2 py-1">
                    <input
                        autoFocus
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        onBlur={() => setIsCreating(false)}
                        placeholder="Folder name..."
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-1">
                {folders.map(folder => (
                    <div
                        key={folder.id}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer ${selectedFolderId === folder.id
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        onClick={() => onSelectFolder(folder.id)}
                    >
                        {editingFolderId === folder.id ? (
                            <input
                                autoFocus
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(folder.id)}
                                onBlur={() => setEditingFolderId(null)}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <>
                                <div className="flex items-center gap-3 truncate">
                                    <Folder className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{folder.name}</span>
                                    {folder._count?.projects ? (
                                        <span className="text-xs text-slate-500">({folder._count.projects})</span>
                                    ) : null}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
                                        }}
                                        className={`p-1 rounded hover:bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ${menuOpenId === folder.id ? 'opacity-100 bg-slate-700' : ''}`}
                                    >
                                        <MoreVertical className="w-3 h-3" />
                                    </button>

                                    {menuOpenId === folder.id && (
                                        <div className="absolute right-0 top-6 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingFolderId(folder.id);
                                                    setEditName(folder.name);
                                                    setMenuOpenId(null);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white"
                                            >
                                                <Edit2 className="w-3 h-3" /> Rename
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(folder.id);
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-700 hover:text-red-300"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderList;
