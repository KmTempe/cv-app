import { ResumeData } from "../../../types/resume";

interface TemplateProps {
    data: ResumeData;
    getSpacingClass: () => string;
}

export function ModernTemplate({ data, getSpacingClass }: TemplateProps) {
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
            {/* CV Header */}
            <div className="flex flex-row items-center justify-between pb-4 mb-4 border-b-[0.5mm]" style={{ borderBottomColor: '#000000' }}>
                <div className="flex-1">
                    <h1 className="font-bold tracking-tight leading-none mb-2 uppercase" style={{ color: '#000000', fontSize: '22pt' }}>
                        {personalInfo.fullName || "Your Name"}
                    </h1>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 font-normal" style={{ color: '#000000', fontSize: '9pt' }}>
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.address && <span>{personalInfo.address}</span>}
                    </div>
                </div>
                {photo && (
                    <div className="ml-4 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="Profile" className="object-cover border" style={{ width: '28mm', height: '28mm', borderColor: '#000000' }} />
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 ${getSpacingClass()}`} style={{ color: '#000000' }}>

                {/* Summary */}
                {summary && (
                    <section>
                        <h2 className="font-bold mb-1 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>About me</h2>
                        <p className="leading-relaxed whitespace-pre-wrap font-normal" style={{ color: '#000000', fontSize: '10pt', marginTop: '2mm' }}>{summary}</p>
                    </section>
                )}

                {/* Experience */}
                {(experience.length > 0) && (
                    <section>
                        <h2 className="font-bold mb-2 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>Work Experience</h2>
                        <div className="space-y-4" style={{ marginTop: '2mm' }}>
                            {experience.map((exp, index) => {
                                if (exp.isHidden) return null;
                                return (
                                    <div key={exp.id || `exp-${index}`} className="print:break-inside-avoid mb-3">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="font-bold" style={{ color: '#000000', fontSize: '10.5pt' }}>{exp.position}</h3>
                                            <span className="font-normal shrink-0" style={{ color: '#000000', fontSize: '9pt' }}>
                                                {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                                            </span>
                                        </div>
                                        <div className="font-bold mb-1 italic" style={{ color: '#000000', fontSize: '9.5pt' }}>{exp.company}</div>
                                        {exp.description && (
                                            <p className="leading-relaxed whitespace-pre-wrap font-normal" style={{ color: '#000000', fontSize: '9.5pt' }}>{exp.description}</p>
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
                        <h2 className="font-bold mb-2 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>Education</h2>
                        <div className="space-y-3" style={{ marginTop: '2mm' }}>
                            {education.map((edu, index) => {
                                if (edu.isHidden) return null;
                                return (
                                    <div key={edu.id || `edu-${index}`} className="flex justify-between items-baseline print:break-inside-avoid mb-2">
                                        <div>
                                            <h3 className="font-bold leading-tight" style={{ color: '#000000', fontSize: '10.5pt' }}>{edu.degree}</h3>
                                            <div className="mt-0.5 italic" style={{ color: '#000000', fontSize: '9.5pt' }}>{edu.institution}</div>
                                        </div>
                                        <div className="font-normal shrink-0" style={{ color: '#000000', fontSize: '9pt' }}>{edu.graduationYear}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {(skills.length > 0) && (
                    <section>
                        <h2 className="font-bold mb-1 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>Skills</h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-zinc-100 rounded-full font-medium" style={{ fontSize: '9pt', color: '#000000' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
