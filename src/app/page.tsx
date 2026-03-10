"use client";

import { useRef } from "react";
import { useResume } from "../context/ResumeContext";
import { Editor } from "../components/Editor/Editor";
import { Preview } from "../components/Preview/Preview";
import type { ResumeData, Experience, Education, LayoutSettings } from "../types/resume";

export default function Home() {
  const { data, setData } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cv.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('JSON file must be smaller than 5 MB.'); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);

          // Basic validation to prevent arbitrary data injection
          const validateData = (data: unknown): Partial<ResumeData> => {
            if (typeof data !== "object" || data === null) return {};
            const d = data as Record<string, unknown>;
            const result: Partial<ResumeData> = {};

            if (d.personalInfo && typeof d.personalInfo === "object") {
              const pi = d.personalInfo as Record<string, unknown>;
              result.personalInfo = {
                fullName: typeof pi.fullName === "string" ? pi.fullName : "",
                email: typeof pi.email === "string" ? pi.email : "",
                phone: typeof pi.phone === "string" ? pi.phone : "",
                address: typeof pi.address === "string" ? pi.address : "",
              };
            }

            if (typeof d.summary === "string") result.summary = d.summary;
            if (typeof d.photo === "string") result.photo = d.photo;

            if (Array.isArray(d.skills)) {
              result.skills = d.skills.filter((s): s is string => typeof s === "string");
            }

            if (Array.isArray(d.experience)) {
              result.experience = d.experience
                .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
                .map((e): Experience => ({
                  id: typeof e.id === "string" ? e.id : Date.now().toString(),
                  company: typeof e.company === "string" ? e.company : "",
                  position: typeof e.position === "string" ? e.position : "",
                  startDate: typeof e.startDate === "string" ? e.startDate : "",
                  endDate: typeof e.endDate === "string" ? e.endDate : "",
                  description: typeof e.description === "string" ? e.description : "",
                  isHidden: typeof e.isHidden === "boolean" ? e.isHidden : false,
                }));
            }

            if (Array.isArray(d.education)) {
              result.education = d.education
                .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
                .map((e): Education => ({
                  id: typeof e.id === "string" ? e.id : Date.now().toString(),
                  institution: typeof e.institution === "string" ? e.institution : "",
                  degree: typeof e.degree === "string" ? e.degree : "",
                  graduationYear: typeof e.graduationYear === "string" ? e.graduationYear : "",
                  isHidden: typeof e.isHidden === "boolean" ? e.isHidden : false,
                }));
            }

            if (d.layout && typeof d.layout === "object") {
              const l = d.layout as Record<string, unknown>;
              const layout: Partial<LayoutSettings> = {};

              if (l.template === "minimal" || l.template === "modern" || l.template === "professional") {
                layout.template = l.template;
              }
              if (l.font === "inter" || l.font === "fira-code" || l.font === "serif" || l.font === "sans") {
                layout.font = l.font;
              }
              if (l.spacing === "compact" || l.spacing === "normal" || l.spacing === "spacious") {
                layout.spacing = l.spacing;
              }

              if (Object.keys(layout).length > 0) {
                result.layout = layout as LayoutSettings;
              }
            }
            return result;
          };

          const safeData = validateData(parsed);

          // Set full data back, keeping defaults if something is missing
          setData(prev => ({
            ...prev,
            ...safeData,
            layout: { ...prev.layout, ...(safeData.layout || {}) }
          }));
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  const triggerJsonUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 selection:bg-primary/30 print:p-0 print:h-auto print:min-h-0 print:block print:overflow-visible print:bg-white text-black">
      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto space-y-8 pb-8 md:pb-16 print:max-w-none print:w-auto print:m-0 print:p-0 print:space-y-0 print:h-auto print:block print:overflow-visible">
        <header className="flex flex-col xl:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-800 print:hidden">
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">CV Maker</h1>
            <p className="text-zinc-400 mt-2 text-sm md:text-base">Build your curriculum vitae, preview instantly, and export to PDF.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleJsonUpload} />
            <div className="flex gap-3 items-center">
              <a
                href="https://l7feeders.dev/"
                target="_blank"
                rel="noopener noreferrer"
                title="Home — l7feeders.dev"
                className="p-3 rounded-full border border-primary/40 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all shadow-sm flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 12 9-9 9 9M5 10.5V21h4v-6h6v6h4V10.5" />
                </svg>
              </a>
              <button onClick={triggerJsonUpload} title="Upload Data (JSON)" className="p-3 rounded-full border border-primary/40 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all shadow-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM12 4L5 11h4v6h6v-6h4L12 4z" /></svg>
              </button>
              <button onClick={handleDownloadJson} title="Download Data (JSON)" className="p-3 rounded-full border border-primary/40 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all shadow-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>
              </button>
              <button onClick={() => window.print()} title="Download PDF" className="p-3 rounded-full bg-primary hover:bg-primary/90 text-background transition-all shadow-[0_0_15px_rgba(100,255,218,0.2)] hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] ml-1">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM14 11.5h1v-3h-1v3zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" /></svg>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative print:block print:w-auto">
          <div className="print:hidden">
            <Editor />
          </div>
          <div className="print:block print:w-full lg:sticky lg:top-8">
            <Preview />
          </div>
        </div>
      </div>

      <footer className="w-full text-center py-8 text-sm text-muted-foreground border-t border-border/30 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono">© {new Date().getFullYear()} CV Maker</p>
          <p className="flex items-center gap-2">
            <span className="text-foreground font-medium">Kosmas Temperekidis</span>
            <span className="hidden md:inline text-muted-foreground/30">•</span>
            <span>Version: <span className="font-mono bg-input px-2 py-0.5 rounded text-foreground">v{process.env.APP_VERSION || "0.4.0"}</span></span>
          </p>
        </div>
      </footer>
    </div >
  );
}
