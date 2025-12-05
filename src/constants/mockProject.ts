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
