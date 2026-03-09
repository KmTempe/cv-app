export function sanitizeUrl(url?: string | null): string | undefined {
    if (!url) return undefined;

    const trimmedUrl = url.trim();
    const lowerUrl = trimmedUrl.toLowerCase();

    // Explicitly reject potentially dangerous protocols
    if (
        lowerUrl.startsWith('javascript:') ||
        lowerUrl.startsWith('vbscript:') ||
        lowerUrl.startsWith('data:text/html')
    ) {
        return undefined;
    }

    // Accept safe, standard image data URLs
    if (lowerUrl.startsWith('data:image/')) {
        return trimmedUrl;
    }

    // Optional: Allow HTTP and HTTPS URLs too
    try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            return trimmedUrl;
        }
    } catch {
        // Ignore parsing errors for relative paths, which are generally safe
        if (trimmedUrl.startsWith('/')) {
            return trimmedUrl;
        }
    }

    // Default reject
    return undefined;
}
