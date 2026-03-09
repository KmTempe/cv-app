import { ResumeData, Experience, Education } from '../../types/resume'

describe('Resume Types', () => {
    it('allows constructing a valid ResumeData object without type errors', () => {
        const mockExperience: Experience = {
            id: '1',
            company: 'Tech Corp',
            position: 'Engineer',
            startDate: '2020',
            endDate: '2022',
            description: 'Did some coding.'
        }

        const mockEducation: Education = {
            id: '2',
            institution: 'University',
            degree: 'B.S.',
            graduationYear: '2020'
        }

        const validResume: ResumeData = {
            personalInfo: {
                fullName: 'Jane Doe',
                email: 'jane@example.com',
                phone: '123-456-7890',
                address: '123 Main St'
            },
            summary: 'A great worker.',
            experience: [mockExperience],
            education: [mockEducation],
            skills: ['React', 'TypeScript'],
            photo: null,
            layout: {
                template: 'modern',
                font: 'inter',
                spacing: 'normal'
            }
        }

        expect(validResume.layout.template).toBe('modern')
        expect(validResume.experience[0].company).toBe('Tech Corp')
        expect(validResume.education[0].graduationYear).toBe('2020')
    })
})
