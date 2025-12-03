import { SavedCharacter } from '../types';
import { apiFetch } from './api';

export const saveCharacter = async (character: SavedCharacter) => {
    await apiFetch('/characters', {
        method: 'POST',
        body: JSON.stringify({
            user_id: character.userId,
            name: character.name,
            description: character.description,
            images: character.images
        })
    });
};

export const getUserCharacters = async (userId: string): Promise<SavedCharacter[]> => {
    try {
        const data = await apiFetch(`/characters?user_id=${userId}`);
        if (!Array.isArray(data)) return [];
        return data.map((c: any) => ({
            id: c.id || c._id,
            userId: c.user_id,
            name: c.name,
            description: c.description,
            images: c.images || [],
            createdAt: new Date(c.created_at || Date.now()).getTime()
        }));
    } catch (e) { return []; }
};

export const deleteCharacter = async (characterId: string) => {
    try { await apiFetch(`/characters/${characterId}`, { method: 'DELETE' }); } catch (e) { }
};
