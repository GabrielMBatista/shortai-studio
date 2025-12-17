/**
 * Utility functions for project data manipulation
 */

/**
 * Validates if a string is a "real" title and not a placeholder/fallback.
 */
const isValidTitle = (title: string | null | undefined): boolean => {
    if (!title || typeof title !== 'string') return false;
    const lower = title.toLowerCase().trim();
    return lower.length > 0 &&
        !lower.includes('untitled project') &&
        !lower.includes('projeto sem título') &&
        !lower.includes('sem título') &&
        !lower.startsWith('⏳');
};

/**
 * Recursively searches for a title-like key in an object.
 */
const findTitleDeep = (obj: any, depth: number = 0): string | null => {
    if (!obj || typeof obj !== 'object' || depth > 3) return null;

    // 1. Check Priority Keys at this level
    const priorityKeys = [
        'titulo', 'tittle', 'title', // Portuguese, Typo, English
        'projectTitle', 'videoTitle', 'scriptTitle',
        'id_da_semana', // Schedule ID
        'tema_dia'
    ];

    for (const key of priorityKeys) {
        if (obj[key] && typeof obj[key] === 'string' && isValidTitle(obj[key])) {
            return obj[key];
        }
    }

    // 2. Fallback Keys (lower priority)
    const fallbackKeys = ['name', 'topic', 'subject'];
    for (const key of fallbackKeys) {
        if (obj[key] && typeof obj[key] === 'string' && isValidTitle(obj[key])) {
            return obj[key];
        }
    }

    // 3. Recurse into children (DFS)
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            const found = findTitleDeep(obj[key], depth + 1);
            if (found) return found;
        }
    }

    return null;
};

/**
 * Extracts a human-readable title from a string that might be a recursive JSON or a plain string.
 * Handles cases where the title is embedded in a JSON structure.
 * 
 * @param rawTitle The raw title string or JSON string from generatedTitle or topic
 * @param fallback The fallback string to return if no title can be extracted
 * @returns The extracted title or the fallback
 */
export const extractProjectTitle = (rawTitle: string | null | undefined, fallback: string = 'Untitled Project'): string => {
    if (!rawTitle) return fallback;

    // If it's a simple string that looks like a valid title, return it.
    // BUT if it looks like JSON/Array, we MUST parse it.
    const trimmed = typeof rawTitle === 'string' ? rawTitle.trim() : String(rawTitle);

    // JSON Detection
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const json = JSON.parse(trimmed);
            const found = findTitleDeep(json);
            if (found) return found;

            // If parsed but no title found, check if it's a schedule with 'cronograma'
            if (json.cronograma && json.id_da_semana) return json.id_da_semana;
        } catch (e) {
            // Parse error
        }

        // CRITICAL: If it looks like JSON but we failed to parse or extract, 
        // NEVER return the raw JSON string. Return fallback.
        return fallback;
    }

    // If we are here, it's not JSON. Check if it's a valid title string.
    if (!isValidTitle(trimmed)) {
        return fallback;
    }

    return trimmed;
};

/**
 * Generic deep finder for multiple keys
 */
const findValueDeep = (obj: any, keys: string[], depth: number = 0): string | string[] | null => {
    if (!obj || typeof obj !== 'object' || depth > 3) return null;

    for (const key of keys) {
        if (obj[key]) {
            // Strong match
            return obj[key];
        }
    }

    // Recurse
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            const found = findValueDeep(obj[key], keys, depth + 1);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Extracts a human-readable description from a string that might be a recursive JSON.
 */
export const extractProjectDescription = (rawDesc: string | null | undefined, fallback: string = ''): string => {
    if (!rawDesc) return fallback;
    const trimmed = typeof rawDesc === 'string' ? rawDesc.trim() : String(rawDesc);

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const json = JSON.parse(trimmed);
            const found = findValueDeep(json, ['description', 'generatedDescription', 'desc', 'generated_description', 'resumo']);
            if (found && typeof found === 'string') return found;
        } catch (e) {
            // Ignore
        }
        return fallback; // Don't return raw JSON
    }

    return trimmed;
};

/**
 * Extracts hashtags array from a string/JSON.
 */
export const extractProjectHashtags = (rawTags: string | string[] | null | undefined): string[] => {
    if (!rawTags) return [];

    // If it's already an array, use it
    if (Array.isArray(rawTags)) return rawTags;

    const trimmed = String(rawTags).trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const json = JSON.parse(trimmed);
            // If it's a direct array
            if (Array.isArray(json)) return json;

            // Search for keys
            const found = findValueDeep(json, ['hashtags', 'generated_shorts_hashtags', 'tags', 'keywords', 'generated_tiktok_hashtags']);
            if (Array.isArray(found)) return found;
            if (typeof found === 'string') return found.split(',').map(s => s.trim());
        } catch (e) {
            // Ignore
        }
        return []; // Return empty if failed parse
    }

    // Split string by commas or spaces if it looks like a list
    if (trimmed.includes(',')) return trimmed.split(',').map(s => s.trim());

    // As a last result, if it's just a string, return it as one tag (unless it looks like JSON garbage)
    if (trimmed.length < 50) return [trimmed];

    return [];
};
