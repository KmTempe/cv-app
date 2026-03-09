import { render, screen, fireEvent } from '@testing-library/react'
import { SummarySection } from '../../components/Editor/SummarySection'
import { ResumeProvider } from '../../context/ResumeContext'
import '@testing-library/jest-dom'

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <ResumeProvider>
            {ui}
        </ResumeProvider>
    )
}

describe('SummarySection Component', () => {
    it('renders the text area with placeholder', () => {
        renderWithProvider(<SummarySection />)
        const textarea = screen.getByPlaceholderText(/A brief professional summary/i)
        expect(textarea).toBeInTheDocument()
    })

    it('allows typing into the text area', () => {
        renderWithProvider(<SummarySection />)
        const textarea = screen.getByPlaceholderText(/A brief professional summary/i)

        fireEvent.change(textarea, { target: { value: 'I am a passionate developer.' } })
        expect(textarea).toHaveValue('I am a passionate developer.')
    })
})
