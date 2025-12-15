import { PersonaChat, CreateChatRequest, UpdateChatRequest, AddMessageRequest, PersonaChatMessage } from '../types/persona-chat';

const API_BASE = '/api';

/**
 * API Client para gerenciar histórico de conversas com personas
 */
export const personaChatsApi = {
    /**
     * Lista todos os chats ativos de uma persona (apenas do usuário autenticado)
     */
    async getPersonaChats(personaId: string): Promise<PersonaChat[]> {
        const res = await fetch(`${API_BASE}/personas/${personaId}/chats`);
        if (!res.ok) throw new Error('Failed to fetch persona chats');
        return res.json();
    },

    /**
     * Cria um novo chat
     */
    async createChat(personaId: string, data: CreateChatRequest): Promise<PersonaChat> {
        const res = await fetch(`${API_BASE}/personas/${personaId}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create chat');
        return res.json();
    },

    /**
     * Busca um chat específico com suas mensagens
     */
    async getChat(chatId: string): Promise<PersonaChat> {
        const res = await fetch(`${API_BASE}/chats/${chatId}`);
        if (!res.ok) throw new Error('Failed to fetch chat');
        return res.json();
    },

    /**
     * Atualiza o título de um chat
     */
    async updateChatTitle(chatId: string, data: UpdateChatRequest): Promise<PersonaChat> {
        const res = await fetch(`${API_BASE}/chats/${chatId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update chat');
        return res.json();
    },

    /**
     * Remove um chat
     */
    async deleteChat(chatId: string): Promise<void> {
        const res = await fetch(`${API_BASE}/chats/${chatId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete chat');
    },

    /**
     * Adiciona uma mensagem a um chat
     */
    async addMessage(chatId: string, data: AddMessageRequest): Promise<PersonaChatMessage> {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add message');
        return res.json();
    }
};
