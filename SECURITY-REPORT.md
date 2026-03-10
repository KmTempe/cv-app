# Security Code Review Report — CV Maker

**Project:** cv-app (CV Maker)
**Version:** 0.4.0
**Date:** 2026-03-10
**Scope:** Full client-side codebase, configuration, and dependency review
**Deployment:** Vercel (cvmaker.l7feeders.dev)

---

## Executive Summary

CV Maker is a client-side Next.js 16 application with **no backend, no API routes, no database, and no authentication**. All data is stored in the user's browser via `localStorage`. The attack surface is inherently small.

The codebase demonstrates solid security practices: URL sanitization is applied consistently, React's JSX auto-escaping prevents XSS in rendered content, file uploads are type- and size-validated, and security headers are configured. However, **5 real vulnerabilities** were identified that should be addressed.

| ID | Finding | Severity | Exploitability |
|----|---------|----------|----------------|
| V-01 | CSP allows `unsafe-eval` and `unsafe-inline` | Medium | Moderate |
| V-02 | Missing HSTS header | Medium | Moderate |
| V-03 | `package.json` bundled into client bundle | Low | Easy |
| V-04 | JSON import lacks schema validation | Low | Requires social engineering |
| V-05 | Overly permissive `frame-src blob:` in CSP | Low | Requires existing XSS |

---

## V-01 — Content Security Policy weakened by `unsafe-eval` and `unsafe-inline`

**Severity:** Medium
**File:** `next.config.ts:13`
**CWE:** CWE-693 (Protection Mechanism Failure)

### Description

The Content Security Policy `script-src` directive includes both `'unsafe-eval'` and `'unsafe-inline'`:

```ts
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel.live",
```

These directives effectively disable CSP's primary XSS protection. `unsafe-inline` allows any inline `<script>` tag or event handler to execute, and `unsafe-eval` allows `eval()`, `Function()`, and `setTimeout("string")` to run arbitrary code. If any injection vector exists (even via a third-party script or browser extension), CSP will not block it.

The comment trail suggests this was added for Vercel Live (development preview), but these directives apply to **all routes in production**.

### Remediation

Use Next.js nonce-based CSP for production. Next.js 16 supports this natively:

```ts
// For production, remove unsafe-eval and unsafe-inline
// Use nonce-based approach:
"script-src 'self' 'nonce-${nonce}' https://*.vercel.live",
```

Alternatively, restrict `unsafe-eval`/`unsafe-inline` to development builds only via environment checks in `next.config.ts`.

---

## V-02 — Missing Strict-Transport-Security (HSTS) header

**Severity:** Medium
**File:** `next.config.ts:3-22`
**CWE:** CWE-319 (Cleartext Transmission of Sensitive Information)

### Description

The application is served over HTTPS on Vercel, but the `Strict-Transport-Security` header is not configured in the security headers array. Without HSTS:

- First-time visitors can be intercepted via SSL-stripping (MITM downgrade attack)
- Browsers will not enforce HTTPS-only access on subsequent visits
- The site cannot be submitted to the HSTS preload list

While Vercel's edge may add some transport security, relying on platform defaults rather than explicit configuration is fragile.

### Remediation

Add the HSTS header to the security headers array in `next.config.ts`:

```ts
{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
```

---

## V-03 — `package.json` version and dependency information leaked to client

**Severity:** Low
**File:** `src/app/page.tsx:4`
**CWE:** CWE-200 (Exposure of Sensitive Information)

### Description

The application imports `package.json` directly:

```tsx
import pkg from "../../package.json";
```

This bundles the **entire** `package.json` contents into the client-side JavaScript bundle, including:

- All dependency names and exact versions (e.g., `next: 16.1.6`, `jspdf: 4.2.0`)
- Dev dependency names and versions
- Script definitions and project metadata

An attacker can extract this from the browser's DevTools or the JS bundle and cross-reference exact versions against CVE databases to identify known vulnerabilities in your dependencies.

### Remediation

Replace the direct import with a build-time constant. In `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  env: {
    APP_VERSION: require('./package.json').version,
  },
  // ...
};
```

Then in `page.tsx`:

```tsx
// Replace: import pkg from "../../package.json";
// Use:
const version = process.env.APP_VERSION;
```

This exposes only the version string, not the full dependency tree.

---

## V-04 — JSON import accepts arbitrary data without schema validation

**Severity:** Low
**File:** `src/app/page.tsx:32-38`
**CWE:** CWE-20 (Improper Input Validation)

### Description

When a user uploads a JSON file, the parsed data is spread directly into application state:

```tsx
const parsed = JSON.parse(event.target?.result as string);
setData(prev => ({
    ...prev,
    ...parsed,
    layout: { ...prev.layout, ...(parsed.layout || {}) }
}));
```

There is no validation that the parsed object conforms to the `ResumeData` schema. This means:

1. **Unexpected properties** — A crafted JSON file could inject arbitrary keys into state. While React won't render unknown keys, they persist in `localStorage` via auto-save and bloat storage.

2. **Type confusion** — Fields expected to be strings (e.g., `personalInfo.fullName`) could be set to objects, arrays, or numbers, potentially causing runtime errors or unexpected rendering behavior.

3. **Oversized payloads in state** — While the file is capped at 5MB, a JSON with deeply nested or large string values (e.g., a 4MB `photo` string) would be persisted to `localStorage` and re-parsed on every page load.

4. **Photo field poisoning** — A crafted `photo` value enters state without validation. While `sanitizeUrl()` protects at render time, the malicious value persists in `localStorage` and will be included if the user exports their data as JSON, potentially spreading the payload.

### Attack scenario

An attacker shares a "resume template" JSON file that contains a malicious `photo` field or unexpected keys. The victim imports it, and the poisoned data persists in their browser.

### Remediation

Validate the imported JSON against the `ResumeData` type before merging:

```tsx
function validateResumeData(data: unknown): Partial<ResumeData> {
    if (typeof data !== 'object' || data === null) return {};
    const d = data as Record<string, unknown>;
    const result: Partial<ResumeData> = {};

    if (d.personalInfo && typeof d.personalInfo === 'object') {
        const pi = d.personalInfo as Record<string, unknown>;
        result.personalInfo = {
            fullName: typeof pi.fullName === 'string' ? pi.fullName : '',
            email: typeof pi.email === 'string' ? pi.email : '',
            phone: typeof pi.phone === 'string' ? pi.phone : '',
            address: typeof pi.address === 'string' ? pi.address : '',
        };
    }

    if (typeof d.summary === 'string') result.summary = d.summary;
    if (typeof d.photo === 'string') result.photo = sanitizeUrl(d.photo) ?? null;
    // ... validate remaining fields similarly
    return result;
}
```

---

## V-05 — CSP `frame-src blob:` is overly permissive

**Severity:** Low
**File:** `next.config.ts:18`
**CWE:** CWE-693 (Protection Mechanism Failure)

### Description

The CSP directive includes:

```
frame-src blob: https://*.vercel.live
```

`blob:` in `frame-src` allows any JavaScript-generated blob URL to be loaded inside an `<iframe>`. Combined with the `unsafe-inline` in `script-src` (V-01), an attacker who finds any injection point could:

1. Create a blob containing arbitrary HTML/JS
2. Load it in an iframe on the page
3. Use the iframe for phishing overlays or credential harvesting

### Remediation

If `blob:` in `frame-src` is not required for any feature (PDF preview uses `window.print()`, not iframes), remove it:

```ts
"frame-src https://*.vercel.live",
```

---

## Items reviewed and confirmed secure

The following areas were reviewed and found to be properly implemented. These are **not** vulnerabilities:

| Area | Reason |
|------|--------|
| **XSS via user input** | React JSX auto-escapes all rendered content. No use of `dangerouslySetInnerHTML`, `eval()`, or `innerHTML` anywhere in the codebase. |
| **`sanitizeUrl()` function** | Comprehensive URL sanitization with proper protocol allowlisting. Blocks `javascript:`, `vbscript:`, `data:text/html`, and `file:` schemes. Applied consistently in all 3 templates and the editor. |
| **SVG data URLs** | `sanitizeUrl` allows `data:image/svg+xml;base64,...`. While SVGs can contain `<script>` tags, browsers do **not** execute JavaScript in SVGs loaded via `<img src>`. This is not exploitable. |
| **localStorage without encryption** | The stored data is the user's own CV content on their own browser. Encryption adds complexity without meaningful security benefit for this use case. |
| **Cookie without HttpOnly** | The `cvDataSaved=true` cookie is a non-sensitive boolean flag. `HttpOnly` would prevent legitimate client-side reads without any security benefit. `SameSite=Strict` and conditional `Secure` flag are correctly applied. |
| **Prototype pollution via JSON spread** | `JSON.parse()` creates `__proto__` as a regular own property, not a prototype setter. Spreading with `{...parsed}` copies it as an own property. Not exploitable in modern JS engines. |
| **CSRF** | The application has no server-side state mutations. All data operations are client-side only. CSRF is not applicable. |
| **File upload handling** | Image uploads validate MIME type (`image/*`) and enforce a 5MB size limit. Files are converted to data URLs client-side and never uploaded to a server. |
| **Dependency security** | All runtime dependencies are well-maintained, widely-used packages with no known critical CVEs at time of review. |

---

## Recommendations summary

| Priority | Action |
|----------|--------|
| 1 | Remove `unsafe-eval` and `unsafe-inline` from production CSP (V-01) |
| 2 | Add HSTS header (V-02) |
| 3 | Stop bundling `package.json` in client code (V-03) |
| 4 | Add schema validation for JSON import (V-04) |
| 5 | Remove `blob:` from `frame-src` if unused (V-05) |
