import { User, ApiKeys } from '../types';
import { apiFetch } from './api';
import { encryptData, decryptData } from '../utils/security';

const SESSION_ID_KEY = 'shortsai_user_id';
let currentUserCache: User | null = null;

export const restoreSession = async (): Promise<User | null> => {
    // Try server session first
    try {
        const session = await apiFetch('/auth/session');
        if (session?.user?.email) {
            const users = await apiFetch(`/users?email=${encodeURIComponent(session.user.email)}`);
            const userFromApi = Array.isArray(users) ? users[0] : users;

            if (userFromApi) {
                const userId = userFromApi.id;
                const keys: ApiKeys = {};
                try {
                    const remoteKeys = await apiFetch(`/user/apikeys?user_id=${userId}`);
                    if (remoteKeys) {
                        if (remoteKeys.gemini_key) keys.gemini = decryptData(remoteKeys.gemini_key);
                        if (remoteKeys.elevenlabs_key) keys.elevenlabs = decryptData(remoteKeys.elevenlabs_key);
                        if (remoteKeys.suno_key) keys.suno = decryptData(remoteKeys.suno_key);
                        if (remoteKeys.groq_key) keys.groq = decryptData(remoteKeys.groq_key);
                    }
                } catch (e) { }

                const user = {
                    id: userId,
                    name: userFromApi.name || session.user.name,
                    email: userFromApi.email,
                    avatar: userFromApi.avatar_url || session.user.image,
                    apiKeys: keys,
                    subscriptionPlan: userFromApi.subscription_plan || 'FREE',
                    role: userFromApi.role || 'USER',
                    isBlocked: userFromApi.is_blocked || false
                };
                currentUserCache = user;
                return user;
            }
        }
    } catch (e) {
        // Session check failed, fall through to local storage
    }

    const storedId = localStorage.getItem(SESSION_ID_KEY);
    if (!storedId) {
        currentUserCache = null;
        return null;
    }

    try {
        const remoteKeys = await apiFetch(`/user/apikeys?user_id=${storedId}`);

        const keys: ApiKeys = {};
        if (remoteKeys) {
            if (remoteKeys.gemini_key) keys.gemini = decryptData(remoteKeys.gemini_key);
            if (remoteKeys.elevenlabs_key) keys.elevenlabs = decryptData(remoteKeys.elevenlabs_key);
            if (remoteKeys.suno_key) keys.suno = decryptData(remoteKeys.suno_key);
            if (remoteKeys.groq_key) keys.groq = decryptData(remoteKeys.groq_key);
        }

        let userData: any = { name: 'User', email: '', avatar_url: '' };
        try {
            const userRes = await apiFetch(`/users?user_id=${storedId}`);
            if (Array.isArray(userRes) && userRes.length > 0) userData = userRes[0];
            else if (userRes && userRes.id) userData = userRes;
        } catch (e) { }

        const user = {
            id: storedId,
            name: userData.name || 'Returning User',
            email: userData.email || '',
            avatar: userData.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + storedId,
            apiKeys: keys,
            subscriptionPlan: userData.subscription_plan || 'FREE',
            role: userData.role || 'USER',
            isBlocked: userData.is_blocked || false
        };

        currentUserCache = user;
        return user;

    } catch (e) {
        console.error("Session restore failed", e);
        currentUserCache = null;
        return null;
    }
};

export const loginUser = async (email: string, name: string, avatar: string, id?: string): Promise<User> => {
    let user: User | null = null;

    try {
        let userFromApi;
        try {
            const users = await apiFetch(`/users?email=${encodeURIComponent(email)}`);
            userFromApi = Array.isArray(users) ? users[0] : users;
        } catch (e) { }

        if (!userFromApi) {
            try {
                await apiFetch('/users', {
                    method: 'POST',
                    body: JSON.stringify({ email, name, avatar_url: avatar, google_id: id || '' })
                });
                const usersRetry = await apiFetch(`/users?email=${encodeURIComponent(email)}`);
                userFromApi = Array.isArray(usersRetry) ? usersRetry[0] : usersRetry;
            } catch (e) { }
        }

        if (userFromApi) {
            const userId = userFromApi.id || userFromApi._id;
            let apiKeys: ApiKeys = {};

            try {
                const remoteKeys = await apiFetch(`/user/apikeys?user_id=${userId}`);
                if (remoteKeys) {
                    if (remoteKeys.gemini_key) apiKeys.gemini = decryptData(remoteKeys.gemini_key);
                    if (remoteKeys.elevenlabs_key) apiKeys.elevenlabs = decryptData(remoteKeys.elevenlabs_key);
                    if (remoteKeys.suno_key) apiKeys.suno = decryptData(remoteKeys.suno_key);
                    if (remoteKeys.groq_key) apiKeys.groq = decryptData(remoteKeys.groq_key);
                }
            } catch (e) { }

            user = {
                id: userId,
                name: userFromApi.name,
                email: userFromApi.email,
                avatar: userFromApi.avatar_url || avatar,
                apiKeys: apiKeys,
                subscriptionPlan: userFromApi.subscription_plan || 'FREE',
                role: userFromApi.role || 'USER',
                isBlocked: userFromApi.is_blocked || false
            };
        }
    } catch (error) {
        console.error("Online login failed", error);
        throw error;
    }

    if (user) {
        localStorage.setItem(SESSION_ID_KEY, user.id);
        currentUserCache = user;
    }

    return user!;
};

export const logoutUser = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

    // 1. Clear local state immediately
    localStorage.removeItem(SESSION_ID_KEY);
    currentUserCache = null;

    // 2. Get CSRF Token
    let csrfToken = '';
    try {
        const csrfRes = await fetch(`${apiUrl}/auth/csrf`, { credentials: 'include' });
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken;
    } catch (e) {
        console.warn("Failed to fetch CSRF for logout", e);
    }

    // 3. Create and submit a form programmatically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${apiUrl}/auth/signout`;

    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfToken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = document.createElement('input');
    callbackInput.type = 'hidden';
    callbackInput.name = 'callbackUrl';
    callbackInput.value = window.location.origin;
    form.appendChild(callbackInput);

    document.body.appendChild(form);
    form.submit();
};

export const updateUserApiKeys = async (userId: string, keys: ApiKeys): Promise<User | null> => {
    try {
        const payload = {
            user_id: userId,
            gemini_key: keys.gemini ? encryptData(keys.gemini) : "",
            elevenlabs_key: keys.elevenlabs ? encryptData(keys.elevenlabs) : "",
            suno_key: keys.suno ? encryptData(keys.suno) : "",
            groq_key: keys.groq ? encryptData(keys.groq) : ""
        };
        await apiFetch('/user/apikeys', { method: 'POST', body: JSON.stringify(payload) });
        const session = await restoreSession();
        return session ? { ...session, apiKeys: keys } : null;
    } catch (e) {
        return null;
    }
};

export const getCurrentUserId = (): string | null => {
    return localStorage.getItem(SESSION_ID_KEY);
};

export const getCurrentUser = (): User | null => {
    return currentUserCache;
};
