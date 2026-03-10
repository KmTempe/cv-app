import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { Trash2 } from "lucide-react";

interface CVHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CVHistoryModal({ isOpen, onClose }: CVHistoryModalProps) {
    const { cvHistory, loadFromHistory, deleteFromHistory } = useResume();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">CV History</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary/50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {cvHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No saved CVs found.</p>
                            <p className="text-sm mt-2">Save a CV using the &quot;Save to History&quot; button in Personal Information.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cvHistory.map((item) => (
                                <div key={item.hash} className="bg-input/50 border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-foreground">{item.name || "Untitled CV"}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Saved on: {new Date(item.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => {
                                                loadFromHistory(item.hash);
                                                onClose();
                                            }}
                                            className="px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors font-medium border border-primary/20"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => deleteFromHistory(item.hash)}
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
