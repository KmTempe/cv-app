import { ResumeData } from "../../../types/resume";

interface TemplateProps {
    data: ResumeData;
    getSpacingClass: () => string;
}

export function ProfessionalTemplate({ data, getSpacingClass }: TemplateProps) {
    const { personalInfo, summary, experience, education, skills, photo } = data;

    return (
        <div
            className="min-h-[100%] flex flex-row whitespace-normal break-words"
            style={{
                color: '#000000',
                fontFamily: 'inherit',
                width: '100%',
                minHeight: '297mm',
            }}
        >
            {/* Left Sidebar */}
            <div className="w-[60mm] shrink-0 bg-zinc-50 border-r border-zinc-200 p-[10mm] flex flex-col print:h-auto print:min-h-full">
                {photo && (
                    <div className="mb-6 flex justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="Profile" className="object-cover rounded-xl shadow-sm" style={{ width: '35mm', height: '35mm' }} />
                    </div>
                )}

                {/* Contact Info */}
                <section className="mb-8">
                    <h2 className="font-bold mb-3 uppercase tracking-wider text-zinc-800" style={{ fontSize: '10pt' }}>Contact</h2>
                    <div className="flex flex-col gap-2 font-normal text-zinc-600" style={{ fontSize: '9pt' }}>
                        {personalInfo.email && <span className="break-all">{personalInfo.email}</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.address && <span>{personalInfo.address}</span>}
                    </div>
                </section>

                {/* Skills */}
                {(skills.length > 0) && (
                    <section>
                        <h2 className="font-bold mb-3 uppercase tracking-wider text-zinc-800" style={{ fontSize: '10pt' }}>Skills</h2>
                        <ul className="flex flex-col gap-1.5 font-normal text-zinc-600" style={{ fontSize: '9pt' }}>
                            {skills.map((skill, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-400 shrink-0"></span>
                                    <span>{skill}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>

            {/* Main Content Area (Right side) */}
            <div className={`flex-1 p-[10mm] ${getSpacingClass()}`} style={{ color: '#000000' }}>

                {/* Header Name */}
                <div className="mb-8 border-b-2 border-zinc-800 pb-4">
                    <h1 className="font-bold tracking-tight leading-none uppercase text-zinc-900" style={{ fontSize: '26pt' }}>
                        {personalInfo.fullName || "Your Name"}
                    </h1>
                </div>

                {/* Summary */}
                {summary && (
                    <section>
                        <h2 className="font-bold mb-2 uppercase tracking-wide text-zinc-800" style={{ fontSize: '12pt' }}>Profile</h2>
                        <p className="leading-relaxed whitespace-pre-wrap font-normal" style={{ fontSize: '10pt' }}>{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {(experience.length > 0) && (
                    <section>
                        <h2 className="font-bold mb-4 uppercase tracking-wide text-zinc-800" style={{ fontSize: '12pt' }}>Experience</h2>
                        <div className="space-y-5">
                            {experience.map((exp, index) => {
                                if (exp.isHidden) return null;
                                return (
                                    <div key={exp.id || `exp-${index}`} className="print:break-inside-avoid mb-4">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900" style={{ fontSize: '11pt' }}>{exp.position}</h3>
                                            <span className="font-medium shrink-0 text-zinc-500" style={{ fontSize: '9pt' }}>
                                                {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                                            </span>
                                        </div>
                                        <div className="font-medium text-zinc-600 mb-1.5" style={{ fontSize: '10pt' }}>{exp.company}</div>
                                        {exp.description && (
                                            <p className="leading-relaxed whitespace-pre-wrap font-normal text-zinc-700" style={{ fontSize: '9.5pt' }}>{exp.description}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Education */}
                {(education.length > 0) && (
                    <section>
                        <h2 className="font-bold mb-4 uppercase tracking-wide text-zinc-800" style={{ fontSize: '12pt' }}>Education</h2>
                        <div className="space-y-4">
                            {education.map((edu, index) => {
                                if (edu.isHidden) return null;
                                return (
                                    <div key={edu.id || `edu-${index}`} className="print:break-inside-avoid mb-4">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold text-zinc-900" style={{ fontSize: '11pt' }}>{edu.degree}</h3>
                                            <span className="font-medium shrink-0 text-zinc-500" style={{ fontSize: '9pt' }}>{edu.graduationYear}</span>
                                        </div>
                                        <div className="font-medium text-zinc-600" style={{ fontSize: '10pt' }}>{edu.institution}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
