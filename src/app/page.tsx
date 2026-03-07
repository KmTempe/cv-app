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
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  // FLIP animation refs
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const flipDataRef = useRef<{ id1: string; id2: string; rect1: DOMRect; rect2: DOMRect } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cvData = {
    personalInfo,
    summary,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    experience: experienceList.map(({ id, ...rest }) => rest),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    education: educationList.map(({ id, ...rest }) => rest),
    skills: skills,
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
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select a valid image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhoto(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('JSON file must be smaller than 5 MB.'); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          // Validate and coerce each field to expected types before setting state
          if (data.personalInfo && typeof data.personalInfo === 'object') {
            setPersonalInfo({
              fullName: String(data.personalInfo.fullName ?? ''),
              email: String(data.personalInfo.email ?? ''),
              phone: String(data.personalInfo.phone ?? ''),
              address: String(data.personalInfo.address ?? ''),
            });
          }
          if (typeof data.summary === 'string') setSummary(data.summary);
          if (Array.isArray(data.experience)) {
            setExperienceList(data.experience.map((exp: Omit<Experience, 'id'>, i: number) => ({
              id: Date.now().toString() + i,
              company: String(exp.company ?? ''),
              position: String(exp.position ?? ''),
              startDate: String(exp.startDate ?? ''),
              endDate: String(exp.endDate ?? ''),
              description: String(exp.description ?? ''),
            })));
          }
          if (Array.isArray(data.education)) {
            setEducationList(data.education.map((edu: Omit<Education, 'id'>, i: number) => ({
              id: Date.now().toString() + i,
              institution: String(edu.institution ?? ''),
              degree: String(edu.degree ?? ''),
              graduationYear: String(edu.graduationYear ?? ''),
            })));
          }
          if (data.skills) {
            setSkills(Array.isArray(data.skills) ? data.skills.map(String) : typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
          }
          // Only accept data:image/ URIs for the photo field
          if (typeof data.photo === 'string' && data.photo.startsWith('data:image/')) {
            setPhoto(data.photo);
          }
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

    // ── Photo ──────────────────────────────────────────────────────────────
    const photoSize = 28; // mm (width & height of the photo box)
    const photoGap = 4;   // mm gap between text and photo
    let headerTextW = contentW; // default: full content width

    if (photo) {
      try {
        // Determine image format from the data URI
        const formatMatch = photo.match(/^data:image\/(png|jpeg|jpg|webp);/i);
        const imgFormat = formatMatch ? formatMatch[1].toUpperCase().replace('JPG', 'JPEG') : 'JPEG';
        const photoX = pageW - mR - photoSize;
        const photoY = y;
        pdf.addImage(photo, imgFormat, photoX, photoY, photoSize, photoSize);
        headerTextW = contentW - photoSize - photoGap;
      } catch (err) {
        console.warn('Failed to embed photo in PDF', err);
      }
    }

    // ── Header ─────────────────────────────────────────────────────────────
    pdf.setFont(FONT, 'bold');
    pdf.setFontSize(22);
    const nameLines = pdf.splitTextToSize((personalInfo.fullName || 'Your Name').toUpperCase(), headerTextW);
    pdf.text(nameLines, mL, y);
    y += nameLines.length * 8;

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

    // Make sure Y is past the photo before drawing the separator line
    if (photo) {
      y = Math.max(y, mT + photoSize + 2);
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
          if (data.skills) setSkills(Array.isArray(data.skills) ? data.skills.map(String) : typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
          if (data.photo) setPhoto(data.photo);
        } catch (error) {
          console.error("Error loading saved data from local storage", error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to local storage on every change
  useEffect(() => {
    // We don't want to save empty default states if nothing has been modified, but a simple approach is to always save
    const timer = setTimeout(() => {
      const dataToSave = {
        personalInfo,
        summary,
        experience: experienceList,
        education: educationList,
        skills: skills,
        photo
      };
      localStorage.setItem('cvAutoSave', JSON.stringify(dataToSave));
      // Set a certified cookie that expires in 1 year (31536000 seconds)
      const secureFlag = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `cvDataSaved=true; max-age=31536000; SameSite=Strict${secureFlag}`;
    }, 500); // debounce savings

    return () => clearTimeout(timer);
  }, [personalInfo, summary, experienceList, educationList, skills, photo]);

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    const index = experienceList.findIndex(e => e.id === id);
    if (index === -1) return;
    let swapIndex = -1;
    if (direction === 'up' && index > 0) swapIndex = index - 1;
    else if (direction === 'down' && index < experienceList.length - 1) swapIndex = index + 1;
    if (swapIndex === -1) return;

    // FIRST: capture positions before swap
    const swapId = experienceList[swapIndex].id;
    const el1 = cardRefs.current.get(id);
    const el2 = cardRefs.current.get(swapId);
    if (el1 && el2) {
      flipDataRef.current = { id1: id, id2: swapId, rect1: el1.getBoundingClientRect(), rect2: el2.getBoundingClientRect() };
    }

    const newList = [...experienceList];
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
    setExperienceList(newList);
  };

  const moveEducation = (id: string, direction: 'up' | 'down') => {
    const index = educationList.findIndex(e => e.id === id);
    if (index === -1) return;
    let swapIndex = -1;
    if (direction === 'up' && index > 0) swapIndex = index - 1;
    else if (direction === 'down' && index < educationList.length - 1) swapIndex = index + 1;
    if (swapIndex === -1) return;

    // FIRST: capture positions before swap
    const swapId = educationList[swapIndex].id;
    const el1 = cardRefs.current.get(id);
    const el2 = cardRefs.current.get(swapId);
    if (el1 && el2) {
      flipDataRef.current = { id1: id, id2: swapId, rect1: el1.getBoundingClientRect(), rect2: el2.getBoundingClientRect() };
    }

    const newList = [...educationList];
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
    setEducationList(newList);
  };

  // FLIP: after DOM re-renders, animate cards from old position to new
  useEffect(() => {
    if (!flipDataRef.current) return;
    const { id1, id2, rect1, rect2 } = flipDataRef.current;
    flipDataRef.current = null;

    const el1 = cardRefs.current.get(id1);
    const el2 = cardRefs.current.get(id2);
    if (!el1 || !el2) return;

    // LAST: get new positions
    const newRect1 = el1.getBoundingClientRect();
    const newRect2 = el2.getBoundingClientRect();

    // INVERT: move elements back to old positions
    const dy1 = rect1.top - newRect1.top;
    const dy2 = rect2.top - newRect2.top;

    el1.style.transform = `translateY(${dy1}px)`;
    el2.style.transform = `translateY(${dy2}px)`;
    el1.style.transition = 'none';
    el2.style.transition = 'none';

    // PLAY: animate to new positions
    requestAnimationFrame(() => {
      el1.style.transition = 'transform 0.3s ease';
      el2.style.transition = 'transform 0.3s ease';
      el1.style.transform = '';
      el2.style.transform = '';
    });
  }, [experienceList, educationList]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 selection:bg-primary/30">
      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto space-y-8 pb-8 md:pb-16">
        <header className="flex flex-col xl:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-800">
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
              <button onClick={handleDownloadPdf} title="Download PDF" className="p-3 rounded-full bg-primary hover:bg-primary/90 text-background transition-all shadow-[0_0_15px_rgba(100,255,218,0.2)] hover:shadow-[0_0_20px_rgba(100,255,218,0.4)] ml-1">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM14 11.5h1v-3h-1v3zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" /></svg>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">

          {/* EDITOR COLUMN */}
          <div className="flex flex-col gap-6 w-full">

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
                  <div key={exp.id} ref={el => { if (el) cardRefs.current.set(exp.id, el); else cardRefs.current.delete(exp.id); }} className="bg-background border border-border/50 p-4 rounded-xl space-y-4 group">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      {index > 0 && (
                        <button onClick={() => moveExperience(exp.id, 'up')} title="Move Up" className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-sm transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                      )}
                      {index < experienceList.length - 1 && (
                        <button onClick={() => moveExperience(exp.id, 'down')} title="Move Down" className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-sm transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                      <button
                        onClick={() => removeExperience(exp.id)}
                        title="Remove Entry"
                        className="p-1.5 rounded-full shadow-sm transition-colors"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
                  <div key={edu.id} ref={el => { if (el) cardRefs.current.set(edu.id, el); else cardRefs.current.delete(edu.id); }} className="bg-background border border-border/50 p-4 rounded-xl space-y-4 group">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      {index > 0 && (
                        <button onClick={() => moveEducation(edu.id, 'up')} title="Move Up" className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-sm transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                      )}
                      {index < educationList.length - 1 && (
                        <button onClick={() => moveEducation(edu.id, 'down')} title="Move Down" className="bg-input text-muted-foreground hover:bg-input/80 hover:text-foreground p-1.5 rounded-full shadow-sm transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      )}
                      <button
                        onClick={() => removeEducation(edu.id)}
                        title="Remove Entry"
                        className="p-1.5 rounded-full shadow-sm transition-colors"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
                        onClick={() => setSkills(skills.filter((_, i) => i !== index))}
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
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
                      const newSkill = skillInput.replace(',', '').trim();
                      if (newSkill && !skills.includes(newSkill)) {
                        setSkills([...skills, newSkill]);
                      }
                      setSkillInput('');
                    }
                  }}
                  className="w-full bg-input border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all"
                  placeholder="Type a skill and press comma or Enter... (e.g. React, Docker)"
                />
              </div>
            </section>
          </div>

          {/* PREVIEW COLUMN */}
          <div className="flex flex-col gap-6 w-full lg:sticky lg:top-8 h-full min-h-[500px] lg:h-[calc(100vh-8rem)]">
            <div className="bg-card border border-border/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full ring-1 ring-border/20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card z-10">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground font-mono font-medium tracking-wide uppercase">Live Preview</div>
                </div>
              </div>
              <div className="flex-1 bg-zinc-100 p-4 sm:p-8 flex items-start overflow-auto custom-scrollbar">
                <div
                  className="bg-white shadow-lg origin-top-left transition-transform duration-200 flex flex-col mx-auto"
                  style={{
                    width: '210mm',
                    minHeight: '297mm', // Minimum A4 Height, can grow infinitely
                    transform: 'scale(var(--cv-scale, 1))',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    marginBottom: 'calc((1 - var(--cv-scale, 1)) * -297mm)', // Reclaim the vertical space lost by scaling
                    marginRight: 'calc((1 - var(--cv-scale, 1)) * -210mm)' // Reclaim horizontal space for perfect centering
                  }}
                >
                  <div className="h-full flex flex-col whitespace-normal break-words" style={{ padding: '20mm', color: '#000000', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>

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

                    {/* Main Content Area - Switched to simple vertical flow for better ATS/OCR reading */}
                    <div className="flex-1 space-y-6" style={{ color: '#000000' }}>

                      {/* Summary */}
                      {summary && (
                        <section>
                          <h2 className="font-bold mb-1 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>About me</h2>
                          <p className="leading-relaxed whitespace-pre-wrap font-normal" style={{ color: '#000000', fontSize: '10pt', marginTop: '2mm' }}>{summary}</p>
                        </section>
                      )}

                      {/* Experience */}
                      {(experienceList.length > 0) && (
                        <section>
                          <h2 className="font-bold mb-2 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>Work Experience</h2>
                          <div className="space-y-4" style={{ marginTop: '2mm' }}>
                            {experienceList.map(exp => (
                              <div key={exp.id}>
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
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Education */}
                      {(educationList.length > 0) && (
                        <section>
                          <h2 className="font-bold mb-2 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>Education</h2>
                          <div className="space-y-3" style={{ marginTop: '2mm' }}>
                            {educationList.map(edu => (
                              <div key={edu.id} className="flex justify-between items-baseline">
                                <div>
                                  <h3 className="font-bold leading-tight" style={{ color: '#000000', fontSize: '10.5pt' }}>{edu.degree}</h3>
                                  <div className="mt-0.5 italic" style={{ color: '#000000', fontSize: '9.5pt' }}>{edu.institution}</div>
                                </div>
                                <div className="font-normal shrink-0" style={{ color: '#000000', fontSize: '9pt' }}>{edu.graduationYear}</div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Skills */}
                      {(cvData.skills.length > 0) && (
                        <section>
                          <h2 className="font-bold mb-1 uppercase tracking-wide border-b-[0.3mm] pb-0.5" style={{ color: '#000000', borderBottomColor: '#000000', fontSize: '11pt' }}>Skills</h2>
                          <p className="font-normal leading-relaxed" style={{ color: '#000000', fontSize: '10pt', marginTop: '2mm' }}>
                            {cvData.skills.join(' • ')}
                          </p>
                        </section>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
