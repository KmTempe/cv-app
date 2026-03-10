"use client";

import { useResume } from "../../context/ResumeContext";
import { sanitizeUrl } from "@/utils/sanitizeUrl";

export function PersonalInfoSection() {
    const { data, updatePersonalInfo, updatePhoto } = useResume();
    const { personalInfo, photo } = data;

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
        </section>
    );
}
