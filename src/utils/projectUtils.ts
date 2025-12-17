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

    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const json = JSON.parse(trimmed);
            const found = findTitleDeep(json);
            if (found) return found;

            // If parsed but no title found, check if it's a schedule with 'cronograma'
            // and we missed id_da_semana for some reason (handled in findTitleDeep, but double check)
            if (json.cronograma && json.id_da_semana) return json.id_da_semana;
        } catch (e) {
            // Parse error, fall through
        }
    }

    // If we are here, it's either not JSON, or JSON parse failed, or no title found in JSON.
    // If the raw strings IS "Untitled Project" (or similar), return fallback.
    if (!isValidTitle(trimmed)) {
        return fallback;
    }

    return trimmed;
};
