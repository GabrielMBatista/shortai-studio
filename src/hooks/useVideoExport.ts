
import { useState, useRef } from 'react';
import { Scene } from '../types';
import i18n from '../i18n';

interface UseVideoExportProps {
    scenes: Scene[];
    bgMusicUrl?: string;
    title?: string;
    endingVideoFile?: File | null; // Kept for interface compat, but warned
    showSubtitles?: boolean;
    projectId?: string; // New required prop for server-side render
}

export const useVideoExport = ({ scenes, bgMusicUrl, title, endingVideoFile, projectId }: UseVideoExportProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState("");
    const [downloadError, setDownloadError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    
    // Kept for compatibility with component usage
    const eta = null; 

    const checkStatus = async (jobId: string) => {
        if (!isDownloading) return; // Stop polling if cancelled
        
        try {
            // Using absolute URL or relative depending on vite proxy config. 
            // Assuming /api is proxied to backend
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
            const res = await fetch(`${apiUrl}/render/${jobId}`);
            
            if (!res.ok) throw new Error("Failed to poll status");
            const job = await res.json();
            
            if (job.status === 'completed') {
                setIsDownloading(false);
                setDownloadProgress(i18n.t('video_player.export_complete') || "Export Complete!");
                setResultUrl(job.resultUrl);
                
                // Auto-trigger download tab or prompt
                const a = document.createElement('a');
                a.href = job.resultUrl;
                a.download = title ? `${title}.mp4` : 'video.mp4';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

            } else if (job.status === 'failed') {
                throw new Error(job.error || "Render failed on server");
            } else {
                setDownloadProgress(i18n.t('video_player.rendering_server') || "Rendering on server...");
                setTimeout(() => checkStatus(jobId), 5000);
            }
        } catch (e: any) {
            setDownloadError(e.message);
            setIsDownloading(false);
        }
    };

    const startExport = async (format: 'mp4' | 'webm' = 'mp4') => {
        if (!projectId) {
            setDownloadError("Project ID missing. Cannot render on server.");
            return;
        }

        if (endingVideoFile) {
            // Verify if we can allow this. Server cannot access local File object.
            // Would need to upload it first. For now, warn.
            alert("Aviso: 'Vídeo Final' local não é suportado na renderização via servidor ainda. Ele será ignorado.");
        }

        setIsDownloading(true);
        setDownloadError(null);
        setResultUrl(null);
        setDownloadProgress("Iniciando...");

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
            console.log("Queueing render job at", `${apiUrl}/render`);
            
            const res = await fetch(`${apiUrl}/render`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    scenes,
                    bgMusicUrl
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to queue job");
            }

            const { jobId } = await res.json();
            setDownloadProgress("Job enfileirado. Aguardando servidor...");
            
            // Start polling
            setTimeout(() => checkStatus(jobId), 2000);

        } catch (e: any) {
            console.error("Export start error:", e);
            setDownloadError(e.message);
            setIsDownloading(false);
        }
    };

    const cancelExport = () => {
        // Since it's server side, we can't truly 'cancel' the process easily without another API call.
        // For now, we just stop listening in the UI.
        setIsDownloading(false);
        setDownloadProgress("");
    };

    return {
        isDownloading,
        downloadProgress,
        downloadError,
        eta,
        resultUrl,
        startExport,
        cancelExport
    };
};
