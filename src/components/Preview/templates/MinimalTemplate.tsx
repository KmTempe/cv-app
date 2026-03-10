import { ResumeData } from "../../../types/resume";
import { sanitizeUrl } from "@/utils/sanitizeUrl";

interface TemplateProps {
    data: ResumeData;
    getSpacingClass: () => string;
}

export function MinimalTemplate({ data, getSpacingClass }: TemplateProps) {
    const { personalInfo, summary, experience, education, skills, photo } = data;

    return (
        <div
            className="min-h-[100%] flex flex-col print:block whitespace-normal break-words"
            style={{
                padding: '10mm',
                color: '#000000',
                fontFamily: 'inherit',
                width: '100%',
            }}
        >
            {/* Minimal CV Header centered */}
            <div className="flex flex-col items-center justify-center mb-6 text-center">
                {photo && (
                    <div className="mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sanitizeUrl(photo)} alt="Profile" className="object-cover rounded-full" style={{ width: '30mm', height: '30mm' }} />
                    </div>
                )}
                <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: '24pt' }}>
                    {personalInfo.fullName || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-normal" style={{ fontSize: '10pt' }}>
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {(personalInfo.email && personalInfo.phone) && <span>|</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {((personalInfo.email || personalInfo.phone) && personalInfo.address) && <span>|</span>}
                    {personalInfo.address && <span>{personalInfo.address}</span>}
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 ${getSpacingClass()}`}>

                {/* Summary */}
                {summary && (
                    <section>
                        <p className="leading-relaxed whitespace-pre-wrap font-normal" style={{ fontSize: '10pt' }}>{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {(experience.length > 0) && (
                    <section>
                        <h2 className="font-bold border-b border-black pb-1 mb-3 uppercase tracking-wider" style={{ fontSize: '12pt' }}>Experience</h2>
                        <div className="space-y-4">
                            {experience.map((exp, index) => {
                                if (exp.isHidden) return null;
                                return (
                                    <div key={exp.id || `exp-${index}`} className="print:break-inside-avoid mb-3">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold" style={{ fontSize: '11pt' }}>{exp.position}</h3>
                                            <span className="font-normal shrink-0" style={{ fontSize: '9.5pt' }}>
                                                {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                                            </span>
                                        </div>
                                        <div className="italic mb-1" style={{ fontSize: '10pt' }}>{exp.company}</div>
                                        {exp.description && (
                                            <p className="leading-relaxed whitespace-pre-wrap font-normal" style={{ fontSize: '9.5pt' }}>{exp.description}</p>
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
                        <h2 className="font-bold border-b border-black pb-1 mb-3 uppercase tracking-wider" style={{ fontSize: '12pt' }}>Education</h2>
                        <div className="space-y-3">
                            {education.map((edu, index) => {
                                if (edu.isHidden) return null;
                                return (
                                    <div key={edu.id || `edu-${index}`} className="flex justify-between items-baseline print:break-inside-avoid mb-2">
                                        <div>
                                            <h3 className="font-bold leading-tight" style={{ fontSize: '11pt' }}>{edu.institution}</h3>
                                            <div className="italic" style={{ fontSize: '10pt' }}>{edu.degree}</div>
                                        </div>
                                        <div className="font-normal shrink-0" style={{ fontSize: '9.5pt' }}>{edu.graduationYear}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {(skills.length > 0) && (
                    <section>
                        <h2 className="font-bold border-b border-black pb-1 mb-3 uppercase tracking-wider" style={{ fontSize: '12pt' }}>Skills</h2>
                        <p className="font-normal leading-relaxed" style={{ fontSize: '10pt' }}>
                            {skills.join(', ')}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}
