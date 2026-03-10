"use client";

import { ThemeSidebar } from "./ThemeSidebar";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { SummarySection } from "./SummarySection";
import { ExperienceSection } from "./ExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";

export function Editor() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <ThemeSidebar />
            <PersonalInfoSection />
            <SummarySection />
            <ExperienceSection />
            <EducationSection />
            <SkillsSection />
        </div>
    );
}
