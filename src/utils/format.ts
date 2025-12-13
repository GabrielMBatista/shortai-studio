/**
 * Format utils for numbers, dates, etc.
 */

/**
 * Format large numbers with K/M suffixes
 * @example formatNumber(1500) => "1.5K"
 * @example formatNumber(2500000) => "2.5M"
 */
export function formatNumber(num: number): string {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
