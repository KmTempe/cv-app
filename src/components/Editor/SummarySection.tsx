"use client";

import { useResume } from "../../context/ResumeContext";

export function SummarySection() {
    const { data, updateSummary } = useResume();

    return (
        <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                About Me
            </h2>
            <div className="space-y-1.5">
                <textarea
                    value={data.summary}
                    onChange={e => updateSummary(e.target.value)}
                    rows={4}
                    className="w-full bg-input border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all resize-y"
                    placeholder="A brief professional summary..."
                />
            </div>
        </section>
    );
}
