"use client";

import { useState, useEffect } from "react";
import { useResume } from "../../context/ResumeContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Eye, EyeOff, Trash2, Plus } from "lucide-react";

export function ExperienceSection() {
    const { data, addExperience, updateExperience, removeExperience, reorderExperience } = useResume();
    const { experience } = data;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;
        reorderExperience(result.source.index, result.destination.index);
    };

    return (
        <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <span className="bg-primary/20 text-primary p-1.5 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                    Work Experience
                </h2>
                <button onClick={addExperience} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                    <Plus size={16} />
                    Add Entry
                </button>
            </div>

            <div className="space-y-4">
                {experience.length === 0 && <p className="text-muted-foreground text-sm italic">No experience added yet.</p>}

                {mounted && (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="experience-list">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                    {experience.map((exp, index) => (
                                        <Draggable key={exp.id || `exp-${index}`} draggableId={exp.id || `exp-${index}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`bg-background border p-4 rounded-xl space-y-4 group transition-colors transition-shadow duration-200 ${snapshot.isDragging ? 'border-primary shadow-2xl shadow-primary/20 rotate-[1deg] scale-[1.02] z-50 ring-2 ring-primary/50 opacity-95' : 'border-border/50 hover:border-border'
                                                        } ${exp.isHidden ? 'opacity-50 grayscale-[50%]' : ''}`}
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
                                                                onClick={() => updateExperience(exp.id, 'isHidden', !exp.isHidden)}
                                                                title={exp.isHidden ? "Show in Preview" : "Hide from Preview"}
                                                                className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-sm transition-colors"
                                                            >
                                                                {exp.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                                            </button>

                                                            <button
                                                                onClick={() => removeExperience(exp.id)}
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
                                                        <div><input type="text" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Company Name" disabled={exp.isHidden} /></div>
                                                        <div><input type="text" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Job Title" disabled={exp.isHidden} /></div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input type="text" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Start Date" disabled={exp.isHidden} />
                                                            <input type="text" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="End Date" disabled={exp.isHidden} />
                                                        </div>
                                                    </div>
                                                    <textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} rows={3} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors resize-y" placeholder="Job description..." disabled={exp.isHidden} />
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
