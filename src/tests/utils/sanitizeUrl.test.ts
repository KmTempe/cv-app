import { sanitizeUrl } from '../../utils/sanitizeUrl';

describe('sanitizeUrl', () => {
    it('returns undefined for empty strings, null, or undefined', () => {
        expect(sanitizeUrl(undefined)).toBeUndefined();
        expect(sanitizeUrl(null as unknown as string)).toBeUndefined();
        expect(sanitizeUrl('')).toBeUndefined();
        expect(sanitizeUrl('   ')).toBeUndefined();
    });

    it('allows safe http and https URLs', () => {
        expect(sanitizeUrl('https://example.com/profile.jpg')).toBe('https://example.com/profile.jpg');
        expect(sanitizeUrl('http://example.com/profile.jpg')).toBe('http://example.com/profile.jpg');
    });

    it('allows valid image data URLs', () => {
        const dataUrl = 'data:image/png;base64,iVBORw0KGg...';
        expect(sanitizeUrl(dataUrl)).toBe(dataUrl);
        expect(sanitizeUrl('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...')).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...');
    });

    it('allows safe relative paths', () => {
        expect(sanitizeUrl('/images/default-avatar.png')).toBe('/images/default-avatar.png');
    });

    it('blocks dangerous XSS payloads', () => {
        expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
        expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
        expect(sanitizeUrl(' javascript:alert("XSS") ')).toBeUndefined();

        expect(sanitizeUrl('vbscript:msgbox("hello")')).toBeUndefined();
        expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTs8L3NjcmlwdD4=')).toBeUndefined();
    });

    it('blocks unknown or unsupported protocols', () => {
        expect(sanitizeUrl('ftp://example.com/image.png')).toBeUndefined();
        expect(sanitizeUrl('smb://server/share/image.png')).toBeUndefined();
        expect(sanitizeUrl('file:///C:/Windows/System32/cmd.exe')).toBeUndefined();

        // Fails URL parsing and doesn't start with /
        expect(sanitizeUrl('not-a-valid-url')).toBeUndefined();
    });
});
