"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { jobTitlesWithSkills, universalSkills, fallbackSkills } from "@/data/job-titles";

interface SkillsStepProps {
  onDataChange: (data: any) => void;
  initialData?: any;
  desiredJobTitle?: string; // Pass from parent
}

export function SkillsStep({ onDataChange, initialData, desiredJobTitle }: SkillsStepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skills || []);
  const [customSkill, setCustomSkill] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Update skills when initialData changes (only once)
  useEffect(() => {
    if (initialData?.skills && initialData.skills.length > 0 && !initialized) {
      // Limit to 10 skills
      setSelectedSkills(initialData.skills.slice(0, 10));
      setInitialized(true);
    }
  }, [initialData, initialized]);

  // Smart algorithm for skill suggestions
  const suggestedSkills = useMemo(() => {
    const skills: string[] = [];
    
    // 1. If job title is selected, add job-specific skills FIRST
    if (desiredJobTitle) {
      const job = jobTitlesWithSkills.find(j => j.title === desiredJobTitle);
      if (job) {
        skills.push(...job.skills);
        
        // If job has less than 12 skills, add universal skills at the end
        if (job.skills.length < 12) {
          const additionalUniversal = universalSkills
            .filter(s => !skills.includes(s))
            .slice(0, 12 - job.skills.length);
          skills.push(...additionalUniversal);
        } else {
          // Add 3 universal skills at the end
          const randomUniversal = universalSkills
            .filter(s => !skills.includes(s))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          skills.push(...randomUniversal);
        }
      }
    } else {
      // 2. No job title selected - use fallback skills
      skills.push(...fallbackSkills);
    }
    
    return skills;
  }, [desiredJobTitle]);

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      // Remove skill
      const updated = selectedSkills.filter((s) => s !== skill);
      setSelectedSkills(updated);
      onDataChange({ skills: updated });
    } else {
      // Add skill only if under limit
      if (selectedSkills.length < 10) {
        const updated = [...selectedSkills, skill];
        setSelectedSkills(updated);
        onDataChange({ skills: updated });
      }
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      if (selectedSkills.length < 10) {
        const updated = [...selectedSkills, customSkill.trim()];
        setSelectedSkills(updated);
        onDataChange({ skills: updated });
        setCustomSkill("");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-text mb-2">
          Select your best 10 skills *
        </label>
        <p className="text-sm text-neutral-text-muted mb-3">
          Prioritize in order of your strongest skills. First 3 selections will be highlighted as your top skills.
        </p>
        <p className="text-sm font-medium text-neutral-text mb-3">
          {selectedSkills.length}/10 selected
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            const selectionIndex = selectedSkills.indexOf(skill);
            const isTopSkill = isSelected && selectionIndex < 3;
            
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleToggleSkill(skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isTopSkill
                    ? "bg-brand-orange text-white ring-2 ring-brand-orange ring-offset-2"
                    : isSelected
                    ? "bg-brand-orange/95 text-white"
                    : "bg-neutral-bg-secondary text-neutral-text hover:bg-neutral-border"
                }`}
              >
                {skill}
                {isTopSkill && <span className="ml-1 text-xs">★</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-text mb-1">
          Add custom skill
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCustomSkill()}
            placeholder="Type a skill and press Enter"
            className="flex-1 px-4 py-2.5 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
          />
          <button
            type="button"
            onClick={handleAddCustomSkill}
            className="px-4 py-2.5 bg-neutral-bg-secondary border border-neutral-border rounded-md hover:bg-neutral-border transition-colors"
          >
            <Plus className="w-5 h-5 text-neutral-text" />
          </button>
        </div>
      </div>

      {selectedSkills.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-text mb-2">
            Your skills ({selectedSkills.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 px-3 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleToggleSkill(skill)}
                  className="hover:bg-brand-orange/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
