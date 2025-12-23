import { useState, useCallback } from 'react';
import { apiFetch } from '../services/api';

interface UploadAssetOptions {
    sceneId: string;
    file: File;
    assetType: 'image' | 'video';
}

interface UploadAssetResult {
    success: boolean;
    url?: string;
    type?: 'image' | 'video';
    scene?: any;
}

export const useAssetUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadAsset = useCallback(async ({ sceneId, file, assetType }: UploadAssetOptions): Promise<UploadAssetResult | null> => {
        setIsUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sceneId', sceneId);
            formData.append('assetType', assetType);

            // Use fetch directly to track upload progress
            const response = await fetch('/api/assets/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            setUploadProgress(100);
            return result;

        } catch (err: any) {
            const errorMessage = err.message || 'Failed to upload asset';
            setError(errorMessage);
            console.error('Upload error:', err);
            return null;
        } finally {
            setIsUploading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setError(null);
    }, []);

    return {
        uploadAsset,
        isUploading,
        uploadProgress,
        error,
        reset
    };
};
