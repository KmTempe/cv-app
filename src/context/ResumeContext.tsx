"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ResumeData, Experience, Education, LayoutSettings, SavedCV } from "../types/resume";

// Extend LayoutSettings to include template inline for context if needed, otherwise rely on types/resume.ts
// Assumption: LayoutSettings is defined in types/resume.ts. We should make sure we pass valid strings.

const defaultData: ResumeData = {
    personalInfo: { fullName: "", email: "", phone: "", address: "" },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    photo: null,
    layout: { font: "inter", spacing: "normal", template: "modern" }
};

interface ResumeContextType {
    data: ResumeData;
    setData: React.Dispatch<React.SetStateAction<ResumeData>>;
    updatePersonalInfo: (field: keyof ResumeData['personalInfo'], value: string) => void;
    updateSummary: (value: string) => void;
    updatePhoto: (value: string | null) => void;
    addExperience: () => void;
    updateExperience: (id: string, field: keyof Experience, value: string | boolean) => void;
    removeExperience: (id: string) => void;
    moveExperience: (id: string, direction: 'up' | 'down') => void;
    reorderExperience: (startIndex: number, endIndex: number) => void;
    addEducation: () => void;
    updateEducation: (id: string, field: keyof Education, value: string | boolean) => void;
    removeEducation: (id: string) => void;
    moveEducation: (id: string, direction: 'up' | 'down') => void;
    reorderEducation: (startIndex: number, endIndex: number) => void;
    setSkills: (skills: string[]) => void;
    updateLayout: (field: keyof LayoutSettings, value: string) => void;
    resetData: () => void;
    cvHistory: SavedCV[];
    currentHash: string | null;
    saveToHistory: () => Promise<void>;
    loadFromHistory: (hash: string) => void;
    deleteFromHistory: (hash: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<ResumeData>(defaultData);
    const [cvHistory, setCvHistory] = useState<SavedCV[]>([]);
    const [currentHash, setCurrentHash] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on initial mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedHistory = localStorage.getItem('cvHistory');
            if (savedHistory) {
                try {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setCvHistory(JSON.parse(savedHistory));
                } catch (e) {
                    console.error("Failed to parse history", e);
                }
            }
        }

        const savedData = typeof window !== 'undefined' ? localStorage.getItem('cvAutoSave') : null;
        let parsed: Partial<ResumeData> | null = null;
        if (savedData) {
            try {
                parsed = JSON.parse(savedData);
            } catch (error) {
                console.error("Error loading saved data from local storage", error);
            }
        }

        setTimeout(() => {
            if (parsed) {
                const seenExpIds = new Set<string>();
                const safeExperience = parsed.experience?.map(exp => {
                    let id = exp.id;
                    if (!id || seenExpIds.has(id)) { id = crypto.randomUUID(); }
                    seenExpIds.add(id);
                    return { ...exp, id };
                });

                const seenEduIds = new Set<string>();
                const safeEducation = parsed.education?.map(edu => {
                    let id = edu.id;
                    if (!id || seenEduIds.has(id)) { id = crypto.randomUUID(); }
                    seenEduIds.add(id);
                    return { ...edu, id };
                });

                setData(prev => ({
                    ...prev,
                    ...parsed,
                    ...(safeExperience ? { experience: safeExperience } : {}),
                    ...(safeEducation ? { education: safeEducation } : {}),
                    layout: { ...prev.layout, ...(parsed?.layout || {}) }
                }));
            }
            setIsLoaded(true);
        }, 0);
    }, []);

    // Save history to local storage on every change
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem('cvHistory', JSON.stringify(cvHistory));
    }, [cvHistory, isLoaded]);

    const generateHash = async (text: string) => {
        const encoder = new TextEncoder();
        const dataToHash = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    useEffect(() => {
        const { fullName, email, phone, address } = data.personalInfo;
        const infoString = `${fullName}|${email}|${phone}|${address}`;
        if (fullName || email || phone || address) {
            generateHash(infoString).then(hash => setCurrentHash(hash));
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentHash(null);
        }
    }, [data.personalInfo]);

    const saveToHistory = async () => {
        if (!currentHash) return;
        const newSavedCV: SavedCV = {
            hash: currentHash,
            timestamp: Date.now(),
            name: data.personalInfo.fullName || "Untitled CV",
            data: data
        };
        setCvHistory(prev => {
            const existingIndex = prev.findIndex(item => item.hash === currentHash);
            if (existingIndex >= 0) {
                const newHistory = [...prev];
                newHistory[existingIndex] = newSavedCV;
                return newHistory;
            }
            return [...prev, newSavedCV];
        });
    };

    const loadFromHistory = (hash: string) => {
        const item = cvHistory.find(h => h.hash === hash);
        if (item) {
            const seenExpIds = new Set<string>();
            const safeExperience = item.data.experience?.map(exp => {
                let id = exp.id;
                if (!id || seenExpIds.has(id)) { id = crypto.randomUUID(); }
                seenExpIds.add(id);
                return { ...exp, id };
            });

            const seenEduIds = new Set<string>();
            const safeEducation = item.data.education?.map(edu => {
                let id = edu.id;
                if (!id || seenEduIds.has(id)) { id = crypto.randomUUID(); }
                seenEduIds.add(id);
                return { ...edu, id };
            });

            setData({
                ...item.data,
                ...(safeExperience ? { experience: safeExperience } : {}),
                ...(safeEducation ? { education: safeEducation } : {})
            });
        }
    };

    const deleteFromHistory = (hash: string) => {
        setCvHistory(prev => prev.filter(h => h.hash !== hash));
    };

    // Save to local storage on every change
    useEffect(() => {
        if (!isLoaded) return;
        const timer = setTimeout(() => {
            localStorage.setItem('cvAutoSave', JSON.stringify(data));
            // Set a certified cookie that expires in 1 year
            const secureFlag = location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = `cvDataSaved=true; max-age=31536000; SameSite=Strict${secureFlag}`;
        }, 500); // debounce savings
        return () => clearTimeout(timer);
    }, [data, isLoaded]);

    // Generators for actions
    const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
        setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
    };

    const updateSummary = (value: string) => setData(prev => ({ ...prev, summary: value }));
    const updatePhoto = (value: string | null) => setData(prev => ({ ...prev, photo: value }));

    const addExperience = () => {
        setData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", description: "", isHidden: false }]
        }));
    };

    const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const removeExperience = (id: string) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    const moveExperience = (id: string, direction: 'up' | 'down') => {
        setData(prev => {
            const index = prev.experience.findIndex(e => e.id === id);
            if (index === -1) return prev;
            let swapIndex = -1;
            if (direction === 'up' && index > 0) swapIndex = index - 1;
            else if (direction === 'down' && index < prev.experience.length - 1) swapIndex = index + 1;
            if (swapIndex === -1) return prev;

            const newList = [...prev.experience];
            [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
            return { ...prev, experience: newList };
        });
    };

    const reorderExperience = (startIndex: number, endIndex: number) => {
        setData(prev => {
            const result = Array.from(prev.experience);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { ...prev, experience: result };
        });
    };

    const addEducation = () => {
        setData(prev => ({
            ...prev,
            education: [...prev.education, { id: crypto.randomUUID(), institution: "", degree: "", graduationYear: "", isHidden: false }]
        }));
    };

    const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
        setData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };

    const removeEducation = (id: string) => {
        setData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    const moveEducation = (id: string, direction: 'up' | 'down') => {
        setData(prev => {
            const index = prev.education.findIndex(e => e.id === id);
            if (index === -1) return prev;
            let swapIndex = -1;
            if (direction === 'up' && index > 0) swapIndex = index - 1;
            else if (direction === 'down' && index < prev.education.length - 1) swapIndex = index + 1;
            if (swapIndex === -1) return prev;

            const newList = [...prev.education];
            [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
            return { ...prev, education: newList };
        });
    };

    const reorderEducation = (startIndex: number, endIndex: number) => {
        setData(prev => {
            const result = Array.from(prev.education);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { ...prev, education: result };
        });
    };

    const setSkills = (skills: string[]) => setData(prev => ({ ...prev, skills }));

    const updateLayout = (field: keyof LayoutSettings, value: string) => {
        setData(prev => ({ ...prev, layout: { ...prev.layout, [field]: value } }));
    };

    const resetData = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cvAutoSave');
            // Remove the cookie correctly, keeping secure flag in mind but simple expiration is enough
            document.cookie = 'cvDataSaved=; max-age=0; path=/;';
        }
        setData(defaultData);
    };

    return (
        <ResumeContext.Provider
            value={{
                data,
                setData,
                updatePersonalInfo,
                updateSummary,
                updatePhoto,
                addExperience,
                updateExperience,
                removeExperience,
                moveExperience,
                reorderExperience,
                addEducation,
                updateEducation,
                removeEducation,
                moveEducation,
                reorderEducation,
                setSkills,
                updateLayout,
                resetData,
                cvHistory,
                currentHash,
                saveToHistory,
                loadFromHistory,
                deleteFromHistory
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
}

export function useResume() {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error("useResume must be used within a ResumeProvider");
    }
    return context;
}

