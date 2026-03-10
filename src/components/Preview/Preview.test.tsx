import { render, screen } from '@testing-library/react'
import { Preview } from './Preview'
import { ResumeProvider } from '../../context/ResumeContext'
import '@testing-library/jest-dom'

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <ResumeProvider>
            {ui}
        </ResumeProvider>
    )
}

describe('Preview Component', () => {
    it('renders the preview container and respects scaling approach', () => {
        const { container } = renderWithProvider(<Preview />)

        // The scaling wrapper should exist
        // It has a transform style inline or via class. Let's look for the main preview div.
        const previewScales = container.querySelectorAll('div[style*="scale(var(--cv-scale, 1))"]')
        expect(previewScales.length).toBeGreaterThan(0)
    })

    it('renders the chosen template', () => {
        renderWithProvider(<Preview />)
        // Since "Your Name" is the default fallback name in templates, it should render it
        expect(screen.getByText(/Your Name/i)).toBeInTheDocument()
    })
})
