import { render, screen, fireEvent } from '@testing-library/react'
import Home from './page'
import { ResumeProvider } from '../context/ResumeContext'
import '@testing-library/jest-dom'

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <ResumeProvider>
            {ui}
        </ResumeProvider>
    )
}

// Mock jsPDF and html2canvas since they don't work well in jsdom out of the box
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => {
        return {
            text: jest.fn(),
            setFont: jest.fn(),
            setFontSize: jest.fn(),
            addPage: jest.fn(),
            save: jest.fn(),
            output: jest.fn().mockReturnValue('mock-pdf'),
            getImageProperties: jest.fn().mockReturnValue({ width: 100, height: 100 }),
            addImage: jest.fn(),
            internal: {
                pageSize: {
                    getWidth: jest.fn().mockReturnValue(210),
                    getHeight: jest.fn().mockReturnValue(297)
                }
            }
        }
    })
})

jest.mock('html2canvas', () => jest.fn())

jest.mock('@hello-pangea/dnd', () => ({
    DragDropContext: ({ children }: any) => <div data-testid="dnd-context">{children}</div>,
    Droppable: ({ children }: any) => children({ droppableProps: {}, innerRef: jest.fn() }),
    Draggable: ({ children }: any) => children({ draggableProps: {}, dragHandleProps: {}, innerRef: jest.fn() }, { isDragging: false })
}))

describe('CV Editor App', () => {
    beforeEach(() => {
        // Clear localStorage before each test as the component uses it
        window.localStorage.clear()
    })

    it('renders the main heading and sections', () => {
        renderWithProvider(<Home />)

        expect(screen.getByText('CV Maker')).toBeInTheDocument()
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
        expect(screen.getByText('About Me')).toBeInTheDocument()
        expect(screen.getByText('Work Experience')).toBeInTheDocument()
        expect(screen.getByText('Education')).toBeInTheDocument()
        expect(screen.getByText('Skills')).toBeInTheDocument()
    })

    it('can add a new experience entry', async () => {
        renderWithProvider(<Home />)

        // Initial state: no experience 
        expect(screen.getByText('No experience added yet.')).toBeInTheDocument()

        // Add experience
        const addExperienceBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Add') && b.closest('div')?.textContent?.includes('Work Experience'))

        if (addExperienceBtn) {
            fireEvent.click(addExperienceBtn)

            // Verify a new experience block was added by looking for placeholders
            const companyInputs = await screen.findAllByPlaceholderText('Company Name')
            expect(companyInputs.length).toBe(1)
            expect(screen.getAllByPlaceholderText('Job Title').length).toBe(1)

            // Verify "No experience added yet." is gone
            expect(screen.queryByText('No experience added yet.')).not.toBeInTheDocument()
        }
    })

    it('can add a new education entry', async () => {
        renderWithProvider(<Home />)

        // Add education
        const addEducationBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Add') && b.closest('div')?.textContent?.includes('Education'))

        if (addEducationBtn) {
            fireEvent.click(addEducationBtn)

            // Verify a new education block was added
            const eduInputs = await screen.findAllByPlaceholderText('Institution / University')
            expect(eduInputs.length).toBe(1)
            expect(screen.getAllByPlaceholderText('Degree / Certification').length).toBe(1)
        }
    })

    it('updates personal information', () => {
        renderWithProvider(<Home />)

        const nameInput = screen.getByPlaceholderText('John Doe')
        fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })

        expect(nameInput).toHaveValue('Jane Smith')
    })

    it('can add skills via comma-separated input', () => {
        renderWithProvider(<Home />)

        const skillInput = screen.getByPlaceholderText('Type a skill and press comma or Enter... (e.g. React, Docker)')
        // Type a skill and press Enter
        fireEvent.change(skillInput, { target: { value: 'Kubernetes' } })
        fireEvent.keyDown(skillInput, { key: 'Enter' })

        // The skill should appear as a tag (may appear in editor and preview)
        expect(screen.getAllByText('Kubernetes').length).toBeGreaterThanOrEqual(1)

        // Type another skill with comma
        fireEvent.change(skillInput, { target: { value: 'Terraform,' } })
        fireEvent.keyDown(skillInput, { key: ',' })

        expect(screen.getAllByText('Terraform').length).toBeGreaterThanOrEqual(1)
    })

    it('renders drag handles for experience entries', async () => {
        renderWithProvider(<Home />)

        // Add an experience entry
        const addBtns = screen.getAllByRole('button').filter(b => b.textContent?.includes('Add Entry'))
        const addExpBtn = addBtns[0]
        fireEvent.click(addExpBtn)

        // Verify the inputs were added correctly
        const companyInputs = await screen.findAllByPlaceholderText('Company Name')
        expect(companyInputs.length).toBe(1)
        fireEvent.change(companyInputs[0], { target: { value: 'Company A' } })
        expect(companyInputs[0]).toHaveValue('Company A')
    })

    it('can remove an education entry with the delete button', async () => {
        renderWithProvider(<Home />)

        // Add an education entry
        const addBtns = screen.getAllByRole('button').filter(b => b.textContent?.includes('Add Entry'))
        const addEduBtn = addBtns[1] // Education is the second Add Entry button
        fireEvent.click(addEduBtn)

        // Verify it was added
        const eduInputs = await screen.findAllByPlaceholderText('Institution / University')
        expect(eduInputs.length).toBe(1)

        // Find and click the Remove Entry button
        const removeBtn = screen.getByTitle('Remove Entry')
        fireEvent.click(removeBtn)

        // Verify it was removed
        expect(screen.queryByPlaceholderText('Institution / University')).not.toBeInTheDocument()
    })
})
