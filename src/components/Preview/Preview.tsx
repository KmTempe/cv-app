"use client";

import { useResume } from "../../context/ResumeContext";
import { ModernTemplate } from "./templates/ModernTemplate";
import { MinimalTemplate } from "./templates/MinimalTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";

export function Preview() {
    const { data } = useResume();
    const { layout } = data;

    // Compute font family based on layout settings
    const getFontFamily = () => {
        switch (layout.font) {
            case 'fira-code': return 'var(--font-fira-code), monospace';
            case 'serif': return 'Georgia, Cambria, "Times New Roman", Times, serif';
            case 'sans': return 'system-ui, -apple-system, sans-serif';
            case 'inter':
            default:
                return 'var(--font-inter), system-ui, -apple-system, sans-serif';
        }
    };

    // Compute spacing multiplier based on layout settings
    const getSpacingClass = () => {
        switch (layout.spacing) {
            case 'compact': return 'space-y-4';
            case 'spacious': return 'space-y-8';
            case 'normal':
            default:
                return 'space-y-6';
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full h-full min-h-[500px] lg:h-[calc(100vh-8rem)] print:h-auto print:block">
            <div className="bg-card border border-border/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-border/20 print:overflow-visible print:border-none print:shadow-none print:h-auto print:block">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card z-10 print:hidden">
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground font-mono font-medium tracking-wide uppercase">Live Preview</div>
                    </div>
                </div>
                <div className="flex-1 bg-zinc-100 flex items-start justify-center overflow-auto py-8 custom-scrollbar print:block print:p-0 print:bg-white print:overflow-visible">
                    <div
                        className="print:w-full print:block flex justify-center origin-top relative"
                        style={{
                            width: 'var(--cv-scale-width, 210mm)',
                            // The height of this wrapper doesn't need to be strictly defined if we let the page flow down 
                        }}
                    >
                        <div
                            className="bg-white shadow-lg flex print:block print:shadow-none print:m-0 overflow-hidden print:overflow-visible relative group origin-top-left print:!scale-100 print:!w-full"
                            style={{
                                width: '210mm',
                                minHeight: '297mm', // Allow it to naturally expand into multiple pages
                                height: 'max-content',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                fontFamily: getFontFamily(),
                                transform: 'scale(var(--cv-scale, 1))',
                                marginBottom: 'calc(-1 * (1 - var(--cv-scale, 1)) * 297mm)'
                            }}
                        >
                            {layout.template === 'modern' && <ModernTemplate data={data} getSpacingClass={getSpacingClass} />}
                            {layout.template === 'minimal' && <MinimalTemplate data={data} getSpacingClass={getSpacingClass} />}
                            {layout.template === 'professional' && <ProfessionalTemplate data={data} getSpacingClass={getSpacingClass} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
