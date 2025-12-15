/**
 * Histórico de conversa com uma persona
 */
export interface PersonaChat {
    id: string;
    personaId: string;
    userId: string;
    channelId?: string;
    title: string;
    isActive: boolean;
    lastMessageAt: string;
    createdAt: string;
    expiresAt: string;
    persona?: {
        id: string;
        name: string;
        category?: string;
    };
    messages?: PersonaChatMessage[];
}

/**
 * Mensagem de um chat com persona
 */
export interface PersonaChatMessage {
    id: string;
    chatId: string;
    role: 'user' | 'model';
    content: string;
    createdAt: string;
}

/**
 * Request para criar novo chat
 */
export interface CreateChatRequest {
    channelId?: string;
    title?: string;
}

/**
 * Request para atualizar chat
 */
export interface UpdateChatRequest {
    title: string;
}

/**
 * Request para adicionar mensagem
 */
export interface AddMessageRequest {
    role: 'user' | 'model';
    content: string;
}
