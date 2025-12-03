import { UsageLog } from '../types';
import { apiFetch } from './api';

export const saveUsageLog = async (log: UsageLog) => {
    try {
        const payload = {
            user_id: log.userId,
            project_id: log.projectId,
            action_type: log.actionType,
            provider: log.provider,
            model_name: log.modelName,
            tokens_input: log.tokensInput || 0,
            tokens_output: log.tokensOutput || 0,
            duration_seconds: log.durationSeconds,
            status: log.status,
            error_message: log.errorMessage,
            idempotency_key: log.idempotencyKey,
            created_at: new Date(log.timestamp).toISOString()
        };

        await apiFetch('/usage', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Failed to save usage log", e);
    }
};
