import { apiFetch } from './api';

export const getFolders = async (): Promise<{ folders: any[]; rootCount: number }> => {
    try {
        const data = await apiFetch('/folders');
        if (Array.isArray(data)) return { folders: data, rootCount: 0 };
        return { folders: data.folders || [], rootCount: data.rootCount || 0 };
    } catch (e) {
        return { folders: [], rootCount: 0 };
    }
};

export const createFolder = async (name: string, parentId?: string) => {
    return await apiFetch('/folders', {
        method: 'POST',
        body: JSON.stringify({ name, parent_id: parentId })
    });
};

export const updateFolder = async (id: string, name: string) => {
    return await apiFetch(`/folders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
    });
};

export const deleteFolder = async (id: string) => {
    return await apiFetch(`/folders/${id}`, {
        method: 'DELETE'
    });
};
