"use client";

import { useState, useEffect } from "react";
import { useResume } from "../../context/ResumeContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Eye, EyeOff, Trash2, Plus } from "lucide-react";

export function EducationSection() {
    const { data, addEducation, updateEducation, removeEducation, reorderEducation } = useResume();
    const { education } = data;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        reorderEducation(result.source.index, result.destination.index);
    };

    return (
        <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <span className="bg-primary/20 text-primary p-1.5 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" /></svg>
                    </span>
                    Education
                </h2>
                <button onClick={addEducation} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    <Plus size={16} />
                    Add Entry
                </button>
            </div>

            <div className="space-y-4">
                {education.length === 0 && <p className="text-muted-foreground text-sm italic">No education added yet.</p>}

                {mounted && (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="education-list">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {education.map((edu, index) => (
                                        <Draggable key={edu.id || `edu-${index}`} draggableId={edu.id || `edu-${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`bg-background border p-4 rounded-xl space-y-4 group transition-colors transition-shadow duration-200 ${snapshot.isDragging ? 'border-primary shadow-2xl shadow-primary/20 rotate-[1deg] scale-[1.02] z-50 ring-2 ring-primary/50 opacity-95' : 'border-border/50 hover:border-border'
                                                        } ${edu.isHidden ? 'opacity-50 grayscale-[50%]' : ''}`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        {/* Drag Handle */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 -ml-2"
                                                        >
                                                            <GripVertical size={18} />
                                                        </div>

                                                        {/* Actions (Toggle & Delete) */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateEducation(edu.id, 'isHidden', !edu.isHidden)}
                                                                title={edu.isHidden ? "Show in Preview" : "Hide from Preview"}
                                                                className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-sm transition-colors"
                                                            >
                                                                {edu.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>

                                                            <button
                                                                onClick={() => removeEducation(edu.id)}
                                                                title="Remove Entry"
                                                                className="p-1.5 rounded-full shadow-sm transition-colors"
                                                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="col-span-1 md:col-span-2"><input type="text" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Institution / University" disabled={edu.isHidden} /></div>
                                                        <div><input type="text" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Degree / Certification" disabled={edu.isHidden} /></div>
                                                        <div><input type="text" value={edu.graduationYear} onChange={e => updateEducation(edu.id, 'graduationYear', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Graduation Year" disabled={edu.isHidden} /></div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    <div key="placeholder" style={{ display: 'contents' }}>
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        </section>
    );
}
