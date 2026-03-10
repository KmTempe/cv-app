"use client";

import { useState } from "react";
import { useResume } from "../../context/ResumeContext";
import { CVHistoryModal } from "../History/CVHistoryModal";
import { sanitizeUrl } from "@/utils/sanitizeUrl";
import { Trash2 } from "lucide-react";

export function PersonalInfoSection() {
    const { data, updatePersonalInfo, updatePhoto, resetData, cvHistory, currentHash, saveToHistory, deleteFromHistory } = useResume();
    const { personalInfo, photo } = data;
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleSave = () => {
        saveToHistory();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 800);
    };

    const existingHistory = cvHistory.find(h => h.hash === currentHash);
    const hasMatchingHistory = !!existingHistory;

    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset your CV? This will clear all data and cannot be undone."
        );
        if (confirmed) {
            resetData();
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert('Please select a valid image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { alert('Image must be smaller than 5 MB.'); return; }
        const reader = new FileReader();
        reader.onloadend = () => { updatePhoto(reader.result as string); };
        reader.readAsDataURL(file);
    };

    return (
        <section className="bg-card border border-border/30 p-6 rounded-2xl shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
                    <span className="bg-primary/20 text-primary p-1.5 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></span>
                    Personal Information
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleSave}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium border border-primary/20"
                    >
                        Save to History
                    </button>
                    <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary-foreground hover:bg-secondary transition-colors font-medium border border-border/50"
                    >
                        View History
                    </button>
                    <button
                        onClick={handleReset}
                        className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors font-medium border border-destructive/20"
                    >
                        Reset CV
                    </button>
                </div>
            </div>
            {hasMatchingHistory && existingHistory && (
                <div className="mb-4 bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl flex flex-col md:flex-row gap-3 items-start md:items-center justify-start">
                    <div className="text-sm text-blue-200">
                        <span className="font-semibold text-blue-100">Saved CV Found:</span> You have a saved CV with this personal information (&quot;{existingHistory.name}&quot;).
                    </div>
                    <div className="flex items-center gap-2 mt-1 md:mt-0">
                        <button onClick={handleSave} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500 hover:text-white transition-colors">
                            Update Saved CV
                        </button>
                        <button
                            onClick={() => deleteFromHistory(currentHash!)}
                            title="Delete Saved CV"
                            className="p-1.5 rounded-full shadow-sm transition-colors flex items-center justify-center shrink-0 w-8 h-8"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Photo (Optional)</label>
                    <div className="flex items-center gap-4">
                        {photo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sanitizeUrl(photo)} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-zinc-800" />
                        )}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-input file:text-foreground hover:file:bg-input/80 transition-all cursor-pointer" />
                        {photo && (
                            <button onClick={() => updatePhoto(null)} className="text-sm text-destructive hover:text-destructive/80">Remove</button>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <input type="text" value={personalInfo.fullName} onChange={e => updatePersonalInfo('fullName', e.target.value)} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Email</label>
                    <input type="email" value={personalInfo.email} onChange={e => updatePersonalInfo('email', e.target.value)} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Phone</label>
                    <input type="tel" value={personalInfo.phone} onChange={e => updatePersonalInfo('phone', e.target.value)} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Address</label>
                    <input type="text" value={personalInfo.address} onChange={e => updatePersonalInfo('address', e.target.value)} className="w-full bg-input border border-border/50 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all" placeholder="New York, USA" />
                </div>
            </div>
            <CVHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
            <div
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full shadow-xl text-sm font-medium z-50 flex items-center gap-2 bg-emerald-500 text-white shadow-emerald-500/20 transition-all duration-500 ease-in-out ${showToast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
            >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                CV Saved Successfully!
            </div>
        </section>
    );
}
