import { apiFetch } from './api';

export const getFolders = async (): Promise<any[]> => {
    try {
        const data = await apiFetch('/folders');
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
};

export const createFolder = async (name: string) => {
    return await apiFetch('/folders', {
        method: 'POST',
        body: JSON.stringify({ name })
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
