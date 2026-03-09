"use client";

import { useResume } from "../../context/ResumeContext";
import { Type, Maximize, LayoutTemplate } from "lucide-react";

export function ThemeSidebar() {
    const { data, updateLayout } = useResume();
    const { layout } = data;

    return (
        <div className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="bg-primary/20 text-primary p-1.5 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                </span>
                Theme Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template */}
                <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <LayoutTemplate size={14} /> Template Layout
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                        {[
                            { id: 'minimal', label: 'Minimal', desc: 'Classic document' },
                            { id: 'modern', label: 'Modern', desc: 'Styled & highlighted' },
                            { id: 'professional', label: 'Professional', desc: 'Two-column sidebar' }
                        ].map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => updateLayout('template', tpl.id)}
                                className={`flex-1 min-w-[140px] p-3 rounded-xl border text-left transition-all snap-start ${layout.template === tpl.id
                                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(100,255,218,0.1)]'
                                    : 'bg-input border-border/50 hover:bg-input/80 hover:border-border'
                                    }`}
                            >
                                <div className={`font-medium mb-1 ${layout.template === tpl.id ? 'text-primary' : 'text-foreground'}`}>
                                    {tpl.label}
                                </div>
                                <div className="text-xs text-muted-foreground">{tpl.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Typography */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Type size={14} /> Typography
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'inter', label: 'Inter', className: 'font-sans' },
                            { id: 'sans', label: 'System', className: 'font-sans' },
                            { id: 'serif', label: 'Serif', className: 'font-serif' },
                            { id: 'fira-code', label: 'Mono', className: 'font-mono' }
                        ].map(font => (
                            <button
                                key={font.id}
                                onClick={() => updateLayout('font', font.id)}
                                className={`py-2 px-3 rounded-lg border text-sm transition-all ${layout.font === font.id
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-input border-border/50 text-muted-foreground hover:bg-input/80 hover:text-foreground'
                                    } ${font.className}`}
                            >
                                {font.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Spacing */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Maximize size={14} /> Spacing
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'compact', label: 'Compact' },
                            { id: 'normal', label: 'Normal' },
                            { id: 'spacious', label: 'Spacious' }
                        ].map(space => (
                            <button
                                key={space.id}
                                onClick={() => updateLayout('spacing', space.id)}
                                className={`py-2 px-3 rounded-lg border text-sm transition-all text-center ${layout.spacing === space.id
                                    ? 'bg-primary/10 border-primary text-primary font-medium'
                                    : 'bg-input border-border/50 text-muted-foreground hover:bg-input/80 hover:text-foreground'
                                    }`}
                            >
                                {space.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
