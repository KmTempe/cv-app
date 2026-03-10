"use client";

import { useState } from "react";
import { useResume } from "../../context/ResumeContext";
import { X } from "lucide-react";

export function SkillsSection() {
    const { data, setSkills } = useResume();
    const [skillInput, setSkillInput] = useState("");
    const { skills } = data;

    const addSkill = (newSkill: string) => {
        const trimmed = newSkill.replace(',', '').trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills([...skills, trimmed]);
        }
    };

    const removeSkill = (indexToRemove: number) => {
        setSkills(skills.filter((_, i) => i !== indexToRemove));
    };

    return (
        <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                Skills
            </h2>

            {/* Skill Pills */}
            {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    {skills.map((skill, index) => (
                        <span
                            key={index}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '9999px',
                                backgroundColor: 'rgba(100, 255, 218, 0.12)',
                                border: '1px solid rgba(100, 255, 218, 0.25)',
                                color: '#64ffda',
                                fontFamily: 'var(--font-mono), "Fira Code", monospace',
                                fontSize: '0.85rem',
                                lineHeight: '1.4',
                                whiteSpace: 'nowrap',
                                cursor: 'default',
                                transition: 'background-color 0.2s, border-color 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(100, 255, 218, 0.22)';
                                e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.45)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = 'rgba(100, 255, 218, 0.12)';
                                e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.25)';
                            }}
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(index)}
                                title="Remove skill"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(100, 255, 218, 0.45)',
                                    cursor: 'pointer',
                                    padding: '0',
                                    lineHeight: '1',
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(100, 255, 218, 0.45)'; }}
                            >
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div>
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block mb-2">Comma separated list</label>
                <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === ',' || e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(skillInput);
                            setSkillInput('');
                        }
                    }}
                    className="w-full bg-input border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                    placeholder="Type a skill and press comma or Enter... (e.g. React, Docker)"
                />
            </div>
        </section>
    );
}
