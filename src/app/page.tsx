"use client";

import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import pkg from "../../package.json";

type Experience = { id: string; company: string; position: string; startDate: string; endDate: string; description: string };
type Education = { id: string; institution: string; degree: string; graduationYear: string };

export default function Home() {
  const [personalInfo, setPersonalInfo] = useState({ fullName: "", email: "", phone: "", address: "" });
  const [summary, setSummary] = useState("");
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [skills, setSkills] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const cvRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cvData = {
    personalInfo,
    summary,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    experience: experienceList.map(({ id, ...rest }) => rest),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    education: educationList.map(({ id, ...rest }) => rest),
    skills: typeof skills === 'string' ? skills.split(",").map(skill => skill.trim()).filter(Boolean) : skills,
    photo
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cv.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.personalInfo) setPersonalInfo(data.personalInfo);
          if (data.summary) setSummary(data.summary);
          if (data.experience) setExperienceList(data.experience.map((exp: Omit<Experience, 'id'>, i: number) => ({ id: Date.now().toString() + i, ...exp })));
          if (data.education) setEducationList(data.education.map((edu: Omit<Education, 'id'>, i: number) => ({ id: Date.now().toString() + i, ...edu })));
          if (data.skills) {
            setSkills(Array.isArray(data.skills) ? data.skills.join(", ") : data.skills);
          }
          if (data.photo) setPhoto(data.photo);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input so the same file could be selected again if needed
    if (e.target) e.target.value = '';
  };

  const triggerJsonUpload = () => {
    fileInputRef.current?.click();
  };

  // Cache loaded fonts so we only fetch once per session
  const loadNotoSans = async (pdf: jsPDF): Promise<void> => {
    const toBase64 = async (url: string): Promise<string> => {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    const [regular, bold, italic, boldItalic] = await Promise.all([
      toBase64('/fonts/NotoSans-Regular.ttf'),
      toBase64('/fonts/NotoSans-Bold.ttf'),
      toBase64('/fonts/NotoSans-Italic.ttf'),
      toBase64('/fonts/NotoSans-BoldItalic.ttf'),
    ]);

    pdf.addFileToVFS('NotoSans-Regular.ttf', regular);
    pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');

    pdf.addFileToVFS('NotoSans-Bold.ttf', bold);
    pdf.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');

    pdf.addFileToVFS('NotoSans-Italic.ttf', italic);
    pdf.addFont('NotoSans-Italic.ttf', 'NotoSans', 'italic');

    pdf.addFileToVFS('NotoSans-BoldItalic.ttf', boldItalic);
    pdf.addFont('NotoSans-BoldItalic.ttf', 'NotoSans', 'bolditalic');
  };

  const buildTextPdf = async (): Promise<jsPDF> => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Embed NotoSans for full Unicode / Greek support
    await loadNotoSans(pdf);
    const FONT = 'NotoSans';


    const pageW = pdf.internal.pageSize.getWidth();   // 210mm
    const pageH = pdf.internal.pageSize.getHeight();  // 297mm
    const mL = 20; // left margin
    const mR = 20; // right margin
    const mT = 20; // top margin
    const mB = 20; // bottom margin
    const contentW = pageW - mL - mR;
    let y = mT;

    // Add a new page and reset Y if we're about to overflow
    const checkPageBreak = (needed: number) => {
      if (y + needed > pageH - mB) {
        pdf.addPage();
        y = mT;
      }
    };

    const sectionGap = 10;
    const lineH = 5.5;

    // ── Header ─────────────────────────────────────────────────────────────
    pdf.setFont(FONT, 'bold');
    pdf.setFontSize(22);
    pdf.text((personalInfo.fullName || 'Your Name').toUpperCase(), mL, y);
    y += 8;

    const contactParts: string[] = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.address) contactParts.push(personalInfo.address);

    if (contactParts.length > 0) {
      pdf.setFont(FONT, 'normal');
      pdf.setFontSize(9);
      pdf.text(contactParts.join('   |   '), mL, y);
      y += 5;
    }

    pdf.setLineWidth(0.5);
    pdf.line(mL, y, pageW - mR, y);
    y += sectionGap;

    // ── About Me ───────────────────────────────────────────────────────────
    if (summary) {
      checkPageBreak(20);
      pdf.setFont(FONT, 'bold');
      pdf.setFontSize(11);
      pdf.text('ABOUT ME', mL, y);
      y += 2;
      pdf.setLineWidth(0.3);
      pdf.line(mL, y, pageW - mR, y);
      y += 5;

      pdf.setFont(FONT, 'normal');
      pdf.setFontSize(10);
      const summaryLines = pdf.splitTextToSize(summary, contentW);
      checkPageBreak(summaryLines.length * lineH + 4);
      pdf.text(summaryLines, mL, y);
      y += summaryLines.length * lineH + sectionGap;
    }

    // ── Work Experience ────────────────────────────────────────────────────
    if (experienceList.length > 0) {
      checkPageBreak(20);
      pdf.setFont(FONT, 'bold');
      pdf.setFontSize(11);
      pdf.text('WORK EXPERIENCE', mL, y);
      y += 2;
      pdf.setLineWidth(0.3);
      pdf.line(mL, y, pageW - mR, y);
      y += 6;

      for (const exp of experienceList) {
        checkPageBreak(18);

        // Position (bold) + date (normal, right-aligned)
        pdf.setFont(FONT, 'bold');
        pdf.setFontSize(10.5);
        pdf.text(exp.position, mL, y);
        const dateStr = exp.startDate
          ? `${exp.startDate}${exp.endDate ? ` — ${exp.endDate}` : ''}`
          : '';
        if (dateStr) {
          pdf.setFont(FONT, 'normal');
          pdf.setFontSize(9);
          pdf.text(dateStr, pageW - mR, y, { align: 'right' });
        }
        y += lineH;

        // Company (bold-italic)
        pdf.setFont(FONT, 'bolditalic');
        pdf.setFontSize(9.5);
        pdf.text(exp.company, mL, y);
        y += lineH;

        // Description
        if (exp.description) {
          pdf.setFont(FONT, 'normal');
          pdf.setFontSize(9.5);
          const descLines = pdf.splitTextToSize(exp.description, contentW);
          checkPageBreak(descLines.length * lineH + 4);
          pdf.text(descLines, mL, y);
          y += descLines.length * lineH;
        }
        y += sectionGap * 0.7;
      }
      y += sectionGap * 0.5;
    }

    // ── Education ──────────────────────────────────────────────────────────
    if (educationList.length > 0) {
      checkPageBreak(20);
      pdf.setFont(FONT, 'bold');
      pdf.setFontSize(11);
      pdf.text('EDUCATION', mL, y);
      y += 2;
      pdf.setLineWidth(0.3);
      pdf.line(mL, y, pageW - mR, y);
      y += 6;

      for (const edu of educationList) {
        checkPageBreak(14);

        pdf.setFont(FONT, 'bold');
        pdf.setFontSize(10.5);
        pdf.text(edu.degree, mL, y);
        if (edu.graduationYear) {
          pdf.setFont(FONT, 'normal');
          pdf.setFontSize(9);
          pdf.text(edu.graduationYear, pageW - mR, y, { align: 'right' });
        }
        y += lineH;

        pdf.setFont(FONT, 'italic');
        pdf.setFontSize(9.5);
        pdf.text(edu.institution, mL, y);
        y += lineH + sectionGap * 0.5;
      }
      y += sectionGap * 0.5;
    }

    // ── Skills ─────────────────────────────────────────────────────────────
    const skillsArr = cvData.skills;
    if (skillsArr.length > 0) {
      checkPageBreak(20);
      pdf.setFont(FONT, 'bold');
      pdf.setFontSize(11);
      pdf.text('SKILLS', mL, y);
      y += 2;
      pdf.setLineWidth(0.3);
      pdf.line(mL, y, pageW - mR, y);
      y += 5;

      pdf.setFont(FONT, 'normal');
      pdf.setFontSize(10);
      const skillsLines = pdf.splitTextToSize(skillsArr.join(' • '), contentW);
      checkPageBreak(skillsLines.length * lineH);
      pdf.text(skillsLines, mL, y);
    }

    return pdf;
  };

  const handleDownloadPdf = async () => {
    try {
      const pdf = await buildTextPdf();
      pdf.save('cv.pdf');
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Failed to generate PDF');
    }
  };

  const generatePdfPreview = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = await buildTextPdf();
      const pdfDataUri = pdf.output('datauristring');
      setPdfUrl(pdfDataUri);
    } catch (err) {
      console.error('Failed to generate PDF preview', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  const addExperience = () => {
    setExperienceList([...experienceList, { id: Date.now().toString(), company: "", position: "", startDate: "", endDate: "", description: "" }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperienceList(experienceList.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperienceList(experienceList.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducationList([...educationList, { id: Date.now().toString(), institution: "", degree: "", graduationYear: "" }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducationList(educationList.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const removeEducation = (id: string) => {
    setEducationList(educationList.filter(edu => edu.id !== id));
  };

  // Load from local storage on initial mount
  useEffect(() => {
    const hasCookie = document.cookie.includes('cvDataSaved=true');
    if (hasCookie) {
      const savedData = localStorage.getItem('cvAutoSave');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.personalInfo) setPersonalInfo(data.personalInfo);
          if (data.summary) setSummary(data.summary);
          if (data.experience) setExperienceList(data.experience);
          if (data.education) setEducationList(data.education);
          if (data.skills) setSkills(Array.isArray(data.skills) ? data.skills.join(", ") : data.skills);
          if (data.photo) setPhoto(data.photo);
        } catch (error) {
          console.error("Error loading saved data from local storage", error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh PDF preview whenever CV data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePdfPreview();
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo, summary, experienceList, educationList, skills, photo]);

  // Save to local storage on every change
  useEffect(() => {
    // We don't want to save empty default states if nothing has been modified, but a simple approach is to always save
    const timer = setTimeout(() => {
      const dataToSave = {
        personalInfo,
        summary,
        experience: experienceList,
        education: educationList,
        skills: typeof skills === 'string' ? skills.split(",").map(skill => skill.trim()).filter(Boolean) : skills,
        photo
      };
      localStorage.setItem('cvAutoSave', JSON.stringify(dataToSave));
      // Set a certified cookie that expires in 1 year (31536000 seconds)
      document.cookie = "cvDataSaved=true; max-age=31536000; SameSite=Strict; Secure";
    }, 500); // debounce savings

    return () => clearTimeout(timer);
  }, [personalInfo, summary, experienceList, educationList, skills, photo]);

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    const index = experienceList.findIndex(e => e.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      const newList = [...experienceList];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setExperienceList(newList);
    } else if (direction === 'down' && index < experienceList.length - 1) {
      const newList = [...experienceList];
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
      setExperienceList(newList);
    }
  };

  const moveEducation = (id: string, direction: 'up' | 'down') => {
    const index = educationList.findIndex(e => e.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
      const newList = [...educationList];
      [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
      setEducationList(newList);
    } else if (direction === 'down' && index < educationList.length - 1) {
      const newList = [...educationList];
      [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
      setEducationList(newList);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 selection:bg-primary/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col xl:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
              CV Maker
            </h1>
            <p className="text-zinc-400 mt-2 text-sm md:text-base">Build your curriculum vitae, preview instantly, and export to PDF.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleJsonUpload} />
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <button onClick={handleDownloadJson} className="flex items-center justify-center gap-3 px-5 py-2 rounded-lg border border-primary/60 bg-transparent hover:bg-primary/10 transition-all group active:scale-[0.98]">
                <svg className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-zinc-200 text-sm font-medium tracking-wide">Download Data</span>
                  <span className="text-zinc-200 text-sm font-medium tracking-wide">(JSON)</span>
                </div>
              </button>
              <button onClick={triggerJsonUpload} className="flex items-center justify-center gap-3 px-5 py-2 rounded-lg border border-primary/60 bg-transparent hover:bg-primary/10 transition-all group active:scale-[0.98]">
                <svg className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-zinc-200 text-sm font-medium tracking-wide">Upload Data</span>
                  <span className="text-zinc-200 text-sm font-medium tracking-wide">(JSON)</span>
                </div>
              </button>
              <button onClick={handleDownloadPdf} className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary hover:bg-primary/90 text-background font-semibold text-sm transition-all shadow-[0_0_15px_rgba(100,255,218,0.2)] hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] active:scale-[0.98] sm:ml-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PDF
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">

          {/* EDITOR COLUMN */}
          <div className="flex flex-col gap-6 w-full pb-20">

            {/* Personal Info */}
            <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-zinc-800" />
                    )}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-input file:text-foreground hover:file:bg-input/80 transition-all cursor-pointer" />
                    {photo && (
                      <button onClick={() => setPhoto(null)} className="text-sm text-destructive hover:text-destructive/80">Remove</button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input type="text" value={personalInfo.fullName} onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email</label>
                  <input type="email" value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Phone</label>
                  <input type="tel" value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Address</label>
                  <input type="text" value={personalInfo.address} onChange={e => setPersonalInfo({ ...personalInfo, address: e.target.value })} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="New York, USA" />
                </div>
              </div>
            </section>

            {/* Summary */}
            <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span>
                About Me
              </h2>
              <div className="space-y-1.5">
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} className="w-full bg-input border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all resize-y" placeholder="A brief professional summary..." />
              </div>
            </section>

            {/* Experience */}
            <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                  Work Experience
                </h2>
                <button onClick={addExperience} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Entry
                </button>
              </div>
              <div className="space-y-4">
                {experienceList.length === 0 && <p className="text-muted-foreground text-sm italic">No experience added yet.</p>}
                {experienceList.map((exp, index) => (
                  <div key={exp.id} className="relative bg-background border border-border/50 p-4 rounded-xl space-y-4 group">
                    <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                      {index > 0 && (
                        <button onClick={() => moveExperience(exp.id, 'up')} className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                      )}
                      {index < experienceList.length - 1 && (
                        <button onClick={() => moveExperience(exp.id, 'down')} className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                      <button onClick={() => removeExperience(exp.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-full shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input type="text" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Company Name" />
                      </div>
                      <div>
                        <input type="text" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Job Title" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Start Date" />
                        <input type="text" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="End Date" />
                      </div>
                    </div>
                    <textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} rows={2} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors resize-y" placeholder="Job description..." />
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" /></svg></span>
                  Education
                </h2>
                <button onClick={addEducation} className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Entry
                </button>
              </div>
              <div className="space-y-4">
                {educationList.length === 0 && <p className="text-muted-foreground text-sm italic">No education added yet.</p>}
                {educationList.map((edu, index) => (
                  <div key={edu.id} className="relative bg-background border border-border/50 p-4 rounded-xl space-y-4 group">
                    <div className="absolute -top-3 -right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                      {index > 0 && (
                        <button onClick={() => moveEducation(edu.id, 'up')} className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                      )}
                      {index < educationList.length - 1 && (
                        <button onClick={() => moveEducation(edu.id, 'down')} className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-md">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                      <button onClick={() => removeEducation(edu.id)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-full shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <input type="text" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Institution / University" />
                      </div>
                      <div>
                        <input type="text" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Degree / Certification" />
                      </div>
                      <div>
                        <input type="text" value={edu.graduationYear} onChange={e => updateEducation(edu.id, 'graduationYear', e.target.value)} className="w-full bg-input border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors" placeholder="Graduation Year" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
                <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                Skills
              </h2>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Comma separated list</label>
                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-input border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="React, TypeScript, Node.js, Next.js" />
              </div>
            </section>
          </div>

          {/* PREVIEW COLUMN */}
          <div className="flex flex-col gap-6 w-full lg:sticky lg:top-8 h-full min-h-[500px] lg:h-[calc(100vh-8rem)]">
            <div className="bg-card border border-border/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-border/20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card z-10">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground font-mono font-medium tracking-wide uppercase">PDF Preview</div>
                  {isGeneratingPdf && (
                    <span className="flex items-center gap-1 text-xs text-primary/70">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Updating...
                    </span>
                  )}
                </div>
                <button
                  onClick={generatePdfPreview}
                  disabled={isGeneratingPdf}
                  className="px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Refresh Preview
                </button>
              </div>
              <div className="flex-1 bg-background/80 p-2 sm:p-4 flex flex-col justify-center items-center">
                {pdfUrl ? (
                  <iframe src={pdfUrl} className="w-full h-full border-none rounded-lg shadow-inner bg-zinc-100" title="CV PDF Preview" />
                ) : (
                  <div className="text-center p-8 max-w-sm">
                    <div className="w-16 h-16 bg-input rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h3 className="text-foreground font-medium mb-2">No Preview Generated</h3>
                    <p className="text-muted-foreground text-sm mb-6">Click refresh below to generate a high-fidelity PDF preview using your current data.</p>
                    <button
                      onClick={generatePdfPreview}
                      className="px-5 py-2 rounded-lg bg-input hover:bg-input/80 text-foreground text-sm font-medium transition-colors border border-border/50 shadow-sm"
                    >
                      Generate Preview
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HIDDEN HTML RENDERER FOR PDF GENERATION */}
      {/* This element is rendered strictly at scale(1) with absolute pixel dimensions for pristine A4 export. */}
      {/* It is removed from the normal document flow and viewport so users don't see it. */}
      {/* Note: Do NOT use opacity-0 here because html2canvas will render it transparent. */}
      {/* We use an absolute container safely out of view but at fixed coordinates so bounds are consistent. */}
      <div style={{ position: 'absolute', top: 0, left: '-200vw', pointerEvents: 'none' }}>
        <div
          ref={cvRef}
          className="w-[210mm] min-h-[297mm] bg-white overflow-hidden shrink-0"
          style={{
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          <div className="p-12 h-full flex flex-col whitespace-normal break-words" style={{ color: '#000000', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

            {/* CV Header */}
            <div className="flex flex-row items-center justify-between border-b-2 pb-6 mb-6" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight leading-none mb-3 uppercase" style={{ color: '#000000' }}>
                  {personalInfo.fullName || "Your Name"}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-normal" style={{ color: '#000000' }}>
                  {personalInfo.email && <span><span className="font-semibold">Email:</span> {personalInfo.email}</span>}
                  {personalInfo.phone && <span><span className="font-semibold">Phone:</span> {personalInfo.phone}</span>}
                  {personalInfo.address && <span><span className="font-semibold">Address:</span> {personalInfo.address}</span>}
                </div>
              </div>
              {photo && (
                <div className="ml-8 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="Profile" className="w-28 h-28 object-cover border" style={{ borderColor: '#000000' }} />
                </div>
              )}
            </div>

            {/* Main Content Area - Switched to simple vertical flow for better ATS/OCR reading */}
            <div className="flex-1 space-y-8" style={{ color: '#000000' }}>

              {/* Summary */}
              {summary && (
                <section>
                  <h2 className="text-lg font-bold mb-2 uppercase tracking-wide border-b pb-1" style={{ color: '#000000', borderBottomColor: '#000000' }}>About me</h2>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal" style={{ color: '#000000' }}>{summary}</p>
                </section>
              )}

              {/* Experience */}
              {(experienceList.length > 0) && (
                <section>
                  <h2 className="text-lg font-bold mb-4 uppercase tracking-wide border-b pb-1" style={{ color: '#000000', borderBottomColor: '#000000' }}>Work Experience</h2>
                  <div className="space-y-5">
                    {experienceList.map(exp => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="text-base font-bold" style={{ color: '#000000' }}>{exp.position}</h3>
                          <span className="text-sm font-normal shrink-0" style={{ color: '#000000' }}>
                            {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ''}
                          </span>
                        </div>
                        <div className="text-sm font-bold mb-1.5 italic" style={{ color: '#000000' }}>{exp.company}</div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal" style={{ color: '#000000' }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {(educationList.length > 0) && (
                <section>
                  <h2 className="text-lg font-bold mb-4 uppercase tracking-wide border-b pb-1" style={{ color: '#000000', borderBottomColor: '#000000' }}>Education</h2>
                  <div className="space-y-4">
                    {educationList.map(edu => (
                      <div key={edu.id} className="flex justify-between items-baseline">
                        <div>
                          <h3 className="text-base font-bold leading-tight" style={{ color: '#000000' }}>{edu.degree}</h3>
                          <div className="text-sm mt-0.5 italic" style={{ color: '#000000' }}>{edu.institution}</div>
                        </div>
                        <div className="text-sm font-normal shrink-0" style={{ color: '#000000' }}>{edu.graduationYear}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {(cvData.skills.length > 0) && (
                <section>
                  <h2 className="text-lg font-bold mb-3 uppercase tracking-wide border-b pb-1" style={{ color: '#000000', borderBottomColor: '#000000' }}>Skills</h2>
                  <p className="text-sm font-normal leading-relaxed" style={{ color: '#000000' }}>
                    {cvData.skills.join(' • ')}
                  </p>
                </section>
              )}
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #112240;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8892b0;
        }

        /* Dynamic scaling for the CV preview */
        @media (max-width: 1536px) {
          :root { --cv-scale: 0.85; --cv-scale-width: calc(210mm * 0.85); }
        }
        @media (max-width: 1280px) {
          :root { --cv-scale: 0.75; --cv-scale-width: calc(210mm * 0.75); }
        }
        @media (max-width: 1024px) {
          :root { --cv-scale: 0.9; --cv-scale-width: calc(210mm * 0.9); }
        }
        @media (max-width: 768px) {
          :root { --cv-scale: 0.8; --cv-scale-width: calc(210mm * 0.8); }
        }
        @media (max-width: 640px) {
          :root { --cv-scale: 0.65; --cv-scale-width: calc(210mm * 0.65); }
        }
        @media (max-width: 480px) {
          :root { --cv-scale: 0.5; --cv-scale-width: calc(210mm * 0.5); }
        }
        @media (max-width: 380px) {
          :root { --cv-scale: 0.4; --cv-scale-width: calc(210mm * 0.4); }
        }
      `}} />

      <footer className="w-full text-center py-8 text-sm text-muted-foreground border-t border-border/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono">© {new Date().getFullYear()} CV Maker</p>
          <p className="flex items-center gap-2">
            <span className="text-foreground font-medium">Kosmas Temperekidis</span>
            <span className="hidden md:inline text-muted-foreground/30">•</span>
            <span>Version: <span className="font-mono bg-input px-2 py-0.5 rounded text-foreground">v{pkg.version}</span></span>
          </p>
        </div>
      </footer>
    </div >
  );
}
