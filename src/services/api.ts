export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include', // Ensure cookies are sent
        });

        if (!res.ok) {
            const errorText = await res.text();
            const error = new Error(`API Error ${res.status}: ${errorText}`);
            (error as any).status = res.status;
            throw error;
        }

        const text = await res.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        if (endpoint === '/usage') {
            throw error;
        }
        console.warn(`API Request failed for ${endpoint}:`, error);
        throw error;
    }
}
