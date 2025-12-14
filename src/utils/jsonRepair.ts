/**
 * Tries to repair a truncated JSON string by closing unclosed objects and arrays.
 * Handles strings to avoid false positives with braces inside quotes.
 */
export function repairTruncatedJson(jsonStr: string): string {
    if (!jsonStr) return "";

    const stack: string[] = [];
    let inString = false;
    let escaped = false;
    let result = jsonStr;

    for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') {
                stack.push('}');
            } else if (char === '[') {
                stack.push(']');
            } else if (char === '}') {
                if (stack.length > 0 && stack[stack.length - 1] === '}') {
                    stack.pop();
                }
            } else if (char === ']') {
                if (stack.length > 0 && stack[stack.length - 1] === ']') {
                    stack.pop();
                }
            }
        }
    }

    // If truncated inside a string, close the quote first
    if (inString) {
        result += '"';
    }

    // Append missing closing braces/brackets in reverse order
    while (stack.length > 0) {
        result += stack.pop();
    }

    return result;
}
