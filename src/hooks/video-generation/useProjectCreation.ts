import { useQueryClient } from '@tanstack/react-query';
import { AppStep, User, VideoProject, ReferenceCharacter, TTSProvider } from '../../types';
import { generateScript, generateMusicPrompt } from '../../services/geminiService';
import { saveProject } from '../../services/storageService';

export const useProjectCreation = (
    user: User | null,
    setProject: React.Dispatch<React.SetStateAction<VideoProject | null>>,
    onError: (msg: string) => void,
    onStepChange: (step: AppStep) => void
) => {
    const queryClient = useQueryClient();

    const generateNewProject = async (
        topic: string,
        style: string,
        voice: string,
        provider: TTSProvider,
        language: string,
        references: ReferenceCharacter[],
        includeMusic: boolean,
        durationConfig: { min: number; max: number; targetScenes?: number } = { min: 55, max: 65 },
        audioModel?: string,
        skipNavigation: boolean = false
    ): Promise<void> => {
        if (!user) { onError("User not authenticated."); return; }

        let scenes: any[] = [];
        let metadata = { title: "", description: "" };
        let finalTopic = topic;

        // Bypassing AI if topic is a pre-generated JSON (Bulk Import)
        let isPreGenerated = false;
        try {
            const parsed = JSON.parse(topic);
            if (parsed && (Array.isArray(parsed.scenes) || Array.isArray(parsed.script))) {
                console.log("Detected pre-generated project JSON");
                isPreGenerated = true;
                scenes = parsed.scenes || parsed.script;

                // Normalize scenes
                scenes = scenes.map((s: any, idx: number) => ({
                    ...s,
                    visualDescription: s.visualDescription || s.visual || s.imagePrompt || s.desc || "Scene visual",
                    narration: s.narration || s.audio || s.text || s.speech || "",
                    sceneNumber: s.sceneNumber || s.scene || (idx + 1)
                }));

                metadata = {
                    title: parsed.title || parsed.projectTitle || parsed.titulo || "Untitled Project",
                    description: parsed.description || parsed.intro || parsed.hook_falado || ""
                };

                // Keep the JSON as the topic for reference, or extract the real topic if available
                finalTopic = parsed.topic || parsed.title || parsed.titulo || "Untitled Logic";
            }
        } catch (e) {
            // Not JSON, proceed with normal generation
        }

        try {
            if (!isPreGenerated) {
                const result = await generateScript(topic, style, language, {
                    minDuration: durationConfig.min,
                    maxDuration: durationConfig.max,
                    targetScenes: durationConfig.targetScenes
                });
                scenes = result.scenes;
                metadata = result.metadata;
            }

            let bgMusicPrompt = "";
            if (includeMusic) {
                if (isPreGenerated && (JSON.parse(topic).bgMusicPrompt || JSON.parse(topic).musicPrompt)) {
                    const parsed = JSON.parse(topic);
                    bgMusicPrompt = parsed.bgMusicPrompt || parsed.musicPrompt;
                } else {
                    try {
                        bgMusicPrompt = await generateMusicPrompt(finalTopic, style);
                    } catch (e) {
                        console.warn("Music prompt gen failed", e);
                        bgMusicPrompt = "cinematic instrumental background music";
                    }
                }
            }

            const newProject: VideoProject = {
                id: crypto.randomUUID(),
                userId: user.id,
                createdAt: Date.now(),
                topic: finalTopic,
                style,
                voiceName: voice,
                ttsProvider: provider,
                language,
                audioModel,
                referenceCharacters: references,
                scenes,
                generatedTitle: metadata.title || "Untitled Project",
                generatedDescription: metadata.description || "No description generated.",
                durationConfig,
                includeMusic,
                bgMusicStatus: includeMusic ? 'pending' : undefined,
                bgMusicPrompt,
                status: 'draft'
            };

            const savedProject = await saveProject(newProject);
            queryClient.invalidateQueries({ queryKey: ['projects', user.id] });

            if (!skipNavigation) {
                setProject(savedProject);
                localStorage.setItem('shortsai_last_project_id', savedProject.id);
                onStepChange(AppStep.SCRIPTING);
            }
        } catch (e: any) {
            console.error(e);
            if (e.message && (e.message.includes('403') || e.message.includes('429'))) {
                onError("Quota limit reached! Please check your plan or API keys.");
            } else {
                onError(e.message || "Failed to generate script.");
            }
            throw e;
        }
    };

    return { generateNewProject };
};
