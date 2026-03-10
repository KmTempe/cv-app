import { render, screen } from '@testing-library/react'
import { ThemeSidebar } from '../../components/Editor/ThemeSidebar'
import { ResumeProvider } from '../../context/ResumeContext'
import '@testing-library/jest-dom'

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <ResumeProvider>
            {ui}
        </ResumeProvider>
    )
}

describe('ThemeSidebar Component', () => {
    it('renders all template options', () => {
        renderWithProvider(<ThemeSidebar />)

        expect(screen.getByText('Professional')).toBeInTheDocument()
        expect(screen.getByText('Modern')).toBeInTheDocument()
        expect(screen.getByText('Minimal')).toBeInTheDocument()
    })

    it('renders font family options', () => {
        renderWithProvider(<ThemeSidebar />)

        expect(screen.getByText('Inter')).toBeInTheDocument()
        expect(screen.getByText('Mono')).toBeInTheDocument()
    })

    it('renders spacing options', () => {
        renderWithProvider(<ThemeSidebar />)

        expect(screen.getByText('Compact')).toBeInTheDocument()
        expect(screen.getByText('Normal')).toBeInTheDocument()
        expect(screen.getByText('Spacious')).toBeInTheDocument()
    })
})
