import { VideoProject } from '../types';

export const MOCK_PROJECT_TOUR: VideoProject = {
    id: 'mock-project-tour',
    userId: 'mock-user',
    createdAt: Date.now(),
    topic: 'Cyberpunk Detective in Neo-Tokyo',
    style: 'Cyberpunk Neon',
    voiceName: 'Fenrir',
    ttsProvider: 'gemini',
    language: 'English',
    status: 'draft',
    scenes: [
        {
            id: 'mock-scene-1',
            sceneNumber: 1,
            visualDescription: 'A rain-slicked neon street in Neo-Tokyo. Holographic ads reflect in puddles.',
            narration: 'The rain never stops in this city. It just washes away the evidence.',
            durationSeconds: 3,
            imageStatus: 'completed',
            audioStatus: 'completed',
            sfxStatus: 'pending',
            videoStatus: 'pending',
            imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop',
        }
    ],
    generatedTitle: 'Neon Shadows',
    generatedDescription: 'A short noir story set in a cyberpunk future.',
    referenceCharacters: []
};

export const MOCK_PROJECT_PREVIEW: VideoProject = {
    id: 'mock-project-preview',
    userId: 'mock-user',
    createdAt: Date.now(),
    topic: 'Space Exploration Documentary',
    style: 'Documentary',
    voiceName: 'Nova',
    ttsProvider: 'gemini',
    language: 'English',
    status: 'completed',
    scenes: [
        {
            id: 'mock-scene-prev-1',
            sceneNumber: 1,
            visualDescription: 'Vast nebula with vibrant colors in deep space.',
            narration: 'The universe is vast, filled with mysteries waiting to be discovered.',
            durationSeconds: 5,
            imageStatus: 'completed',
            audioStatus: 'completed',
            sfxStatus: 'completed',
            videoStatus: 'completed',
            mediaType: 'image',
            imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2070&auto=format&fit=crop',
        }
    ],
    generatedTitle: 'Cosmic Journey',
    generatedDescription: 'A brief look into the cosmos.',
    referenceCharacters: []
};
