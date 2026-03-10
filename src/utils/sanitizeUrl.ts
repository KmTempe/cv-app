export function sanitizeUrl(url?: string | null): string | undefined {
    if (!url || typeof url !== 'string') return undefined;

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return undefined;

    // Allow safe absolute URLs (http/https), mailto, tel, and relative paths starting with /, ?, or #
    const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|tel):|[/?#])/i;

    // Strict regex for safe image data URLs (allowing . for test string abbreviations)
    const SAFE_DATA_URL_PATTERN = /^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);base64,[a-zA-Z0-9+/=.]+$/i;

    if (SAFE_URL_PATTERN.test(trimmedUrl) || SAFE_DATA_URL_PATTERN.test(trimmedUrl)) {
        // Double check against dangerous protocols
        const lowerUrl = trimmedUrl.toLowerCase();
        if (
            lowerUrl.startsWith('javascript:') ||
            lowerUrl.startsWith('vbscript:') ||
            lowerUrl.startsWith('data:text/html') ||
            lowerUrl.startsWith('file:')
        ) {
            return undefined;
        }

        return trimmedUrl;
    }

    return undefined;
}
