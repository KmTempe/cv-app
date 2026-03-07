# CV Maker

A modern, browser-based curriculum vitae builder with real-time preview and PDF export.

**Live:** [cvmaker.l7feeders.dev](https://cvmaker.l7feeders.dev)

## Features

- **Personal Info** — Name, email, phone, address, and optional profile photo
- **About Me** — Professional summary section
- **Work Experience** — Multiple entries with company, title, dates, and description
- **Education** — Multiple entries with institution, degree, and graduation year
- **Skills** — Comma/Enter input with interactive oval pill tags
- **Live Preview** — Real-time A4-scaled preview that mirrors the PDF output
- **PDF Export** — Download as a clean, ATS-friendly PDF with full Unicode/Greek support (NotoSans)
- **JSON Import/Export** — Save and load CV data as JSON files
- **Auto-Save** — Data persists in localStorage between sessions
- **Reorder Entries** — Drag-free up/down arrows with smooth FLIP card-swap animation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + inline styles |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) with embedded NotoSans fonts |
| Testing | Jest + React Testing Library |
| CI | GitHub Actions (preview-tests workflow) |

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/app/
├── page.tsx         # Main CV editor component (editor + preview + PDF)
├── page.test.tsx    # Test suite (7 tests)
├── layout.tsx       # Root layout with metadata
├── globals.css      # CSS variables, responsive scaling
public/fonts/        # NotoSans font files for PDF Unicode support
```

## License

Private project.
