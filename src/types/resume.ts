export type PersonalInfo = {
    fullName: string;
    email: string;
    phone: string;
    address: string;
};

export type Experience = {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    isHidden?: boolean;
};

export type Education = {
    id: string;
    institution: string;
    degree: string;
    graduationYear: string;
    isHidden?: boolean;
};

export type LayoutSettings = {
    template: 'minimal' | 'modern' | 'professional';
    font: 'inter' | 'fira-code' | 'serif' | 'sans';
    spacing: 'compact' | 'normal' | 'spacious';
};

export type ResumeData = {
    personalInfo: PersonalInfo;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
    photo: string | null;
    layout: LayoutSettings;
};
