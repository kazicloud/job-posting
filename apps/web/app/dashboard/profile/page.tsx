"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/dashboard/page-header";
import Link from "next/link";
import { Edit2, Briefcase, GraduationCap, Award, MapPin, Phone, Mail, Loader2, Plus, Camera, Upload, Trash2, Edit3, RefreshCw, RotateCcw, RotateCw, ZoomIn, FileText, Settings } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useUser } from "@clerk/nextjs";

// Career Summary Component
function CareerSummarySection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(profile.jobSeekerProfile?.careerSummary || "");
  const updateCareerSummary = useMutation(api.profile.updateCareerSummary);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCareerSummary({ summary });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save career summary:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-neutral-text">About</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a brief summary about your career goals, experience, and what you're looking for..."
            className="w-full min-h-[120px] sm:min-h-[150px] p-3 border border-neutral-border rounded-md text-sm sm:text-base text-neutral-text placeholder:text-neutral-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
            maxLength={500}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2">
            <span className="text-xs text-neutral-text-muted">
              {summary.length}/500 characters
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setSummary(profile.jobSeekerProfile?.careerSummary || "");
                  setIsEditing(false);
                }}
                className="flex-1 sm:flex-none px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {summary ? (
            <p className="text-neutral-text-secondary leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          ) : (
            <p className="text-neutral-text-muted italic">
              Add a career summary to help employers understand your goals and experience.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Skills Section Component
function SkillsSection({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile.skills?.map((s: any) => s.skillName) || []);
  const [newSkill, setNewSkill] = useState("");
  const addSkill = useMutation(api.educationSkillsMutations.addSkill);
  const deleteSkill = useMutation(api.educationSkillsMutations.deleteSkill);
  const [saving, setSaving] = useState(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get current skills from profile
      const currentSkills = profile.skills?.map((s: any) => s.skillName) || [];
      
      // Find skills to add
      const skillsToAdd = skills.filter(s => !currentSkills.includes(s));
      
      // Find skills to delete
      const skillsToDelete = profile.skills?.filter((s: any) => !skills.includes(s.skillName)) || [];
      
      // Add new skills
      for (const skillName of skillsToAdd) {
        await addSkill({
          userId: profile._id,
          skillName,
          category: "technical",
          proficiency: "intermediate"
        });
      }
      
      // Delete removed skills
      for (const skill of skillsToDelete) {
        await deleteSkill({ id: skill._id });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save skills:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-text">Skills</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4 inline mr-1" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-neutral-bg-secondary text-neutral-text text-sm rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-neutral-text-secondary hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-neutral-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 text-sm bg-neutral-bg-secondary text-neutral-text rounded-md hover:bg-neutral-border transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setSkills(profile.skills?.map((s: any) => s.skillName) || []);
                setNewSkill("");
                setIsEditing(false);
              }}
              className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {profile.skills?.map((skill: any) => (
            <span
              key={skill._id}
              className="px-3 py-1.5 bg-neutral-bg-secondary text-neutral-text text-sm rounded-full"
            >
              {skill.skillName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Edit Work Experience Modal
function EditExperienceModal({ experience, onClose, onSave, onDelete }: any) {
  const [formData, setFormData] = useState({
    title: experience.title || "",
    company: experience.company || "",
    startDate: experience.startDate || "",
    endDate: experience.endDate || "",
    currentlyWorking: experience.currentlyWorking || false,
    description: experience.description || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-text">
            {experience._id ? "Edit Experience" : "Add Experience"}
          </h3>
          <button onClick={onClose} className="text-neutral-text-secondary hover:text-neutral-text">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Job Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Company *</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Start Date *</label>
              <input
                type="text"
                placeholder="YYYY-MM"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">End Date</label>
              <input
                type="text"
                placeholder="YYYY-MM"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={formData.currentlyWorking}
                className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20 disabled:bg-neutral-bg-secondary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={formData.currentlyWorking}
              onChange={(e) => setFormData({ ...formData, currentlyWorking: e.target.checked, endDate: "" })}
              className="w-4 h-4 text-brand-orange border-neutral-border rounded focus:ring-brand-orange"
            />
            <label htmlFor="currentlyWorking" className="text-sm text-neutral-text">
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Education Modal
function EditEducationModal({ education, onClose, onSave, onDelete }: any) {
  const [formData, setFormData] = useState({
    institution: education.institution || "",
    qualificationLevel: education.qualificationLevel || "",
    certificateType: education.certificateType || "",
    fieldOfStudy: education.fieldOfStudy || "",
    startYear: education.startYear || "",
    endYear: education.endYear || "",
    grade: education.grade || "",
  });
  const [saving, setSaving] = useState(false);

  const qualificationLevels = [
    { label: "PhD", value: "phd" },
    { label: "Master's Degree", value: "masters" },
    { label: "Bachelor's Degree", value: "degree" },
    { label: "Diploma", value: "diploma" },
    { label: "Certificate", value: "certificate" },
    { label: "TVET", value: "tvet" },
  ];

  const certificateTypes = [
    "Polytechnic Certificate",
    "Bootcamp Certificate",
    "Professional Certificate",
    "Online Course Certificate",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-text">
            {education._id ? "Edit Education" : "Add Education"}
          </h3>
          <button onClick={onClose} className="text-neutral-text-secondary hover:text-neutral-text">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Institution *</label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              placeholder="e.g., University of Nairobi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Qualification Level *</label>
            <select
              value={formData.qualificationLevel}
              onChange={(e) => setFormData({ ...formData, qualificationLevel: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              required
            >
              <option value="">Select level</option>
              {qualificationLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          {formData.qualificationLevel === "certificate" && (
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Certificate Type</label>
              <select
                value={formData.certificateType}
                onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              >
                <option value="">Select type</option>
                {certificateTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Field of Study *</label>
            <input
              type="text"
              value={formData.fieldOfStudy}
              onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">Start Year *</label>
              <input
                type="text"
                placeholder="YYYY"
                value={formData.startYear}
                onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-text mb-1">End Year *</label>
              <input
                type="text"
                placeholder="YYYY"
                value={formData.endYear}
                onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-text mb-1">Grade/GPA</label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
              placeholder="e.g., First Class, 3.8 GPA"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-border">
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-orange text-white rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function ProfilePage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const generateUploadUrl = useMutation(api.cvUpload.generateUploadUrl);
  const updateProfilePhoto = useMutation(api.profile.updateProfilePhoto);
  const removeProfilePhoto = useMutation(api.profile.removeProfilePhoto);
  const updateWorkExperience = useMutation(api.workExperienceMutations.updateWorkExperience);
  const deleteWorkExperience = useMutation(api.workExperienceMutations.deleteWorkExperience);
  const addWorkExperience = useMutation(api.workExperienceMutations.addWorkExperience);
  const updateEducation = useMutation(api.educationSkillsMutations.updateEducation);
  const deleteEducation = useMutation(api.educationSkillsMutations.deleteEducation);
  const addEducation = useMutation(api.educationSkillsMutations.addEducation);
  const { user } = useUser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [addingExperience, setAddingExperience] = useState(false);
  const [addingEducation, setAddingEducation] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);

  const filters = [
    { name: "Natural", css: "none" },
    { name: "Vibrant", css: "saturate(1.3) contrast(1.1)" },
    { name: "B&W", css: "grayscale(1)" },
    { name: "Warm", css: "sepia(0.3) saturate(1.2)" },
  ];

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (): Promise<Blob> => {
    if (!editingImageUrl) throw new Error("No image to crop");
    
    const image = await createImage(editingImageUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const maxSize = 1024;
    canvas.width = maxSize;
    canvas.height = maxSize;

    // Apply filters
    if (ctx) {
      const filterCss = filters[selectedFilter]?.css || "";
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filterCss}`;

      // Draw rotated and cropped image
      ctx.save();
      ctx.translate(maxSize / 2, maxSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);
    }
    ctx.translate(-maxSize / 2, -maxSize / 2);

    if (croppedAreaPixels) {
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        maxSize,
        maxSize
      );
    }

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, "image/jpeg", 0.95);
    });
  };

  const handleSaveEditedPhoto = async () => {
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg();
      
      // Upload to Convex storage
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: croppedBlob,
      });
      const { storageId } = await uploadResult.json();

      // Update user profile in Convex
      const result = await updateProfilePhoto({ storageId });
      
      // Update Clerk profile image
      if (user && result?.photoUrl) {
        await user.setProfileImage({ file: croppedBlob });
      }
      
      // Reset states
      setEditMode(false);
      setShowPhotoModal(false);
      setEditingImageUrl(null);
      setZoom(1);
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setSelectedFilter(0);
    } catch (error) {
      setUploadError("Failed to save photo");
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    // Load image for editing
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingImageUrl(e.target?.result as string);
      setShowPhotoModal(false);
      setEditMode(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Remove profile photo?")) return;
    
    try {
      setUploading(true);
      await removeProfilePhoto();
      setShowPhotoModal(false);
    } catch (error) {
      setUploadError("Failed to remove photo");
    } finally {
      setUploading(false);
    }
  };

  if (profile === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-neutral-text-secondary">Profile not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusMap: Record<string, string> = {
    employed: "Currently Employed",
    unemployed: "Looking for Work",
    student: "Student",
    freelancer: "Freelancer",
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Show PageHeader only on desktop, show button on mobile */}
        <div className="hidden sm:block">
          <PageHeader
            title="My Profile"
            description="Manage your professional information"
            action={
              profile?.jobSeekerProfile?.profileCompleteness && profile.jobSeekerProfile.profileCompleteness < 100 ? (
                <Link
                  href="/onboarding"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
                >
                  Complete Profile
                </Link>
              ) : null
            }
          />
        </div>
        
        {/* Mobile: Show only Complete Profile button if needed */}
        {profile?.jobSeekerProfile?.profileCompleteness && profile.jobSeekerProfile.profileCompleteness < 100 && (
          <div className="sm:hidden mb-4">
            <Link
              href="/onboarding"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
            >
              Complete Profile ({profile.jobSeekerProfile.profileCompleteness}%)
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Avatar with Circular Progress */}
                <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                  {/* Circular Progress Bar */}
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#E2E8F0"
                      strokeWidth="4"
                      fill="none"
                      className="sm:hidden"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="#E2E8F0"
                      strokeWidth="4"
                      fill="none"
                      className="hidden sm:block"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="#DC842C"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - (profile.jobSeekerProfile?.profileCompleteness || 0) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500 sm:hidden"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="44"
                      stroke="#DC842C"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - (profile.jobSeekerProfile?.profileCompleteness || 0) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500 hidden sm:block"
                    />
                  </svg>
                  
                  {/* Avatar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      disabled={uploading}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-neutral-text group cursor-pointer disabled:cursor-not-allowed"
                    >
                      {profile.profilePhoto ? (
                        <img 
                          src={profile.profilePhoto} 
                          alt={profile.fullName || "User"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl sm:text-2xl font-semibold">
                          {profile.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                        </div>
                      )}
                      
                      {/* Loading overlay */}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-white" />
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      {!uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {/* Completeness percentage */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-neutral-border">
                    <span className="text-xs font-semibold text-brand-orange">
                      {profile.jobSeekerProfile?.profileCompleteness || 0}%
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  {uploadError && (
                    <p className="text-xs text-red-600 mb-2">{uploadError}</p>
                  )}
                  <h2 className="text-xl sm:text-2xl font-semibold text-neutral-text mb-1">
                    {profile.fullName || "User"}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-text-secondary mb-3">{profile.jobSeekerProfile?.headline || "No headline"}</p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-text-secondary">
                    {profile.county && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">{profile.county}, Kenya</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        {profile.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  </div>
                  {profile.jobSeekerProfile?.currentStatus && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs sm:text-sm font-medium rounded-full">
                        ⚡ {statusMap[profile.jobSeekerProfile.currentStatus] || profile.jobSeekerProfile.currentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Career Summary Section */}
            <CareerSummarySection profile={profile} />

            {/* Career Preferences - Modern Card Grid */}
            {profile.jobSeekerProfile && (
              <div className="bg-white border border-neutral-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-text">Career Preferences</h3>
                  <Link
                    href="/dashboard/profile/edit"
                    className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Desired Role */}
                  {profile.jobSeekerProfile.desiredJobTitle && (
                    <div className="p-3 sm:p-4 bg-neutral-bg-secondary rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-text-muted mb-1">Looking for</p>
                          <p className="text-sm sm:text-base font-medium text-neutral-text break-words">{profile.jobSeekerProfile.desiredJobTitle}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience Level */}
                  {profile.jobSeekerProfile.yearsOfExperience !== undefined && (
                    <div className="p-4 bg-neutral-bg-secondary rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-text-muted mb-1">Experience</p>
                          <p className="font-medium text-neutral-text">{profile.jobSeekerProfile.yearsOfExperience} years</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Job Types */}
                  {profile.jobSeekerProfile.jobTypes && profile.jobSeekerProfile.jobTypes.length > 0 && (
                    <div className="p-4 bg-neutral-bg-secondary rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-text-muted mb-1">Job Type</p>
                          <p className="font-medium text-neutral-text capitalize">{profile.jobSeekerProfile.jobTypes.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary Expectation */}
                  {profile.jobSeekerProfile.salaryMin && (
                    <div className="p-4 bg-neutral-bg-secondary rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-text-muted mb-1">Salary Expectation</p>
                          <p className="font-medium text-neutral-text">
                            {profile.jobSeekerProfile.salaryCurrency || "KES"} {profile.jobSeekerProfile.salaryMin.toLocaleString()}+
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {profile.jobSeekerProfile.availability && (
                    <div className="p-4 bg-neutral-bg-secondary rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-text-muted mb-1">Availability</p>
                          <p className="font-medium text-neutral-text capitalize">
                            {profile.jobSeekerProfile.availability === "immediate" ? "Immediate" : 
                             profile.jobSeekerProfile.availability.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interested Industries */}
                  {profile.jobSeekerProfile.desiredIndustries && profile.jobSeekerProfile.desiredIndustries.length > 0 && (
                    <div className="p-4 bg-neutral-bg-secondary rounded-lg md:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-text-muted mb-2">Interested Industries</p>
                          <div className="flex flex-wrap gap-2">
                            {profile.jobSeekerProfile.desiredIndustries.map((industry) => (
                              <span key={industry} className="px-3 py-1 bg-white border border-neutral-border text-neutral-text text-sm rounded-full">
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {profile.workExperience && profile.workExperience.length > 0 && (
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-text">Work Experience</h3>
                  <button
                    onClick={() => setAddingExperience(true)}
                    className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.workExperience.map((exp) => (
                    <div key={exp._id} className="flex gap-3">
                      <div className="w-10 h-10 bg-neutral-bg-secondary rounded flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-neutral-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-text">{exp.title}</h4>
                            <p className="text-sm text-neutral-text-secondary">{exp.company}</p>
                            <p className="text-xs text-neutral-text-muted">
                              {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-neutral-text-secondary mt-2">{exp.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => setEditingExperience(exp)}
                            className="text-neutral-text-secondary hover:text-brand-orange transition-colors flex-shrink-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-text">Education</h3>
                  <button
                    onClick={() => setAddingEducation(true)}
                    className="text-brand-orange hover:text-brand-orange/80 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu._id} className="flex gap-3">
                      <div className="w-10 h-10 bg-neutral-bg-secondary rounded flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-neutral-text-secondary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-text">{edu.fieldOfStudy}</h4>
                            <p className="text-sm text-neutral-text-secondary">{edu.institution}</p>
                            <p className="text-xs text-neutral-text-muted">
                              {edu.qualificationLevel && `${edu.qualificationLevel} · `}
                              {edu.startYear} - {edu.endYear}
                              {edu.grade && ` · ${edu.grade}`}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingEducation(edu)}
                            className="text-neutral-text-secondary hover:text-brand-orange transition-colors flex-shrink-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <SkillsSection profile={profile} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border border-neutral-border rounded-lg p-6">
              <h3 className="text-base font-semibold text-neutral-text mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {profile.jobSeekerProfile?.profileCompleteness && profile.jobSeekerProfile.profileCompleteness < 100 && (
                  <Link
                    href="/onboarding"
                    className="flex items-center justify-between px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors group"
                  >
                    <span>Complete Profile Setup</span>
                    <span className="text-xs text-brand-orange font-medium">
                      {profile.jobSeekerProfile.profileCompleteness}%
                    </span>
                  </Link>
                )}
                {/* <Link
                  href="/dashboard/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-neutral-text-secondary" />
                  <span>Edit Profile</span>
                </Link> */}
                <Link
                  href="/dashboard/applications"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  <FileText className="w-4 h-4 text-neutral-text-secondary" />
                  <span>My Applications</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4 text-neutral-text-secondary" />
                  <span>Account Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      {showPhotoModal && !editMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-text">Profile Photo</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-neutral-text-secondary hover:text-neutral-text"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo Preview */}
            <div className="p-8 flex items-center justify-center bg-neutral-bg-secondary">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-neutral-text">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt={profile.fullName || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl font-semibold">
                    {profile.fullName?.split(" ").map(n => n[0]).join("") || "U"}
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Icon Buttons */}
            <div className="p-6">
              {uploadError && (
                <p className="text-sm text-red-600 mb-3">{uploadError}</p>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={uploading}
                className="hidden"
              />

              <div className="flex items-center justify-between">
                {/* Left - Edit & Change */}
                <div className="flex gap-2">
                  {profile.profilePhoto && (
                    <button
                      onClick={() => {
                        setEditingImageUrl(profile.profilePhoto!);
                        setEditMode(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 border border-neutral-border text-neutral-text text-sm font-medium rounded-md hover:bg-neutral-bg-secondary transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        {profile.profilePhoto ? "Change" : "Upload"}
                      </>
                    )}
                  </button>
                </div>

                {/* Right - Remove */}
                {profile.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              <p className="text-xs text-neutral-text-muted text-center pt-3">
                Max file size: 5MB • Supported: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Modal - Unique Minimal Design */}
      {editMode && editingImageUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-border">
              <h3 className="text-lg font-semibold text-neutral-text">Edit Photo</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditingImageUrl(null);
                    setZoom(1);
                    setRotation(0);
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                    setSelectedFilter(0);
                  }}
                  className="px-4 py-2 text-neutral-text hover:bg-neutral-bg-secondary rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedPhoto}
                  disabled={uploading}
                  className="px-6 py-2 bg-brand-orange text-white font-medium rounded-md hover:bg-brand-orange/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[600px]">
              {/* Cropper Area */}
              <div className="flex-1 relative bg-black">
                <Cropper
                  image={editingImageUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: {
                      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filters[selectedFilter]?.css || ""}`,
                    },
                  }}
                />
              </div>

              {/* Controls Sidebar */}
              <div className="w-80 bg-white p-6 overflow-y-auto space-y-6">
                {/* Filters */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-3">Filters</h4>
                <div className="grid grid-cols-2 gap-4">
                  {filters.map((filter, index) => (
                    <button
                      key={filter.name}
                      onClick={() => setSelectedFilter(index)}
                      className="flex flex-col items-center gap-2 transition-all"
                    >
                      {/* Filter Preview */}
                      <div 
                        className={`w-16 h-16 rounded-full overflow-hidden bg-black transition-all ${
                          selectedFilter === index
                            ? 'ring-2 ring-brand-orange ring-offset-2'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          filter: filter.css
                        }}
                      >
                        <img 
                          src={editingImageUrl} 
                          alt={filter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedFilter === index ? 'text-brand-orange' : 'text-neutral-text-secondary'
                      }`}>
                        {filter.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crop & Position */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-3">Crop & Position</h4>
                
                {/* Zoom */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Zoom</span>
                    <span className="text-xs text-neutral-text-secondary">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>

                {/* Rotate */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Rotate</span>
                    <span className="text-xs text-neutral-text-secondary">{rotation}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRotation(r => r - 15)}
                      className="p-2 border border-neutral-border rounded hover:bg-neutral-bg-secondary transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-neutral-text" />
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                    />
                    <button
                      onClick={() => setRotation(r => r + 15)}
                      className="p-2 border border-neutral-border rounded hover:bg-neutral-bg-secondary transition-colors"
                    >
                      <RotateCw className="w-4 h-4 text-neutral-text" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-text mb-3">Adjustments</h4>
                
                {/* Brightness */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Brightness</span>
                    <span className="text-xs text-neutral-text-secondary">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>

                {/* Contrast */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Contrast</span>
                    <span className="text-xs text-neutral-text-secondary">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-neutral-text-secondary">Saturation</span>
                    <span className="text-xs text-neutral-text-secondary">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-border rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Edit Work Experience Modal */}
      {editingExperience && (
        <EditExperienceModal
          experience={editingExperience}
          onClose={() => setEditingExperience(null)}
          onSave={async (data: any) => {
            await updateWorkExperience({ id: editingExperience._id, ...data });
            setEditingExperience(null);
          }}
          onDelete={async () => {
            if (confirm("Delete this experience?")) {
              await deleteWorkExperience({ id: editingExperience._id });
              setEditingExperience(null);
            }
          }}
        />
      )}

      {/* Add Work Experience Modal */}
      {addingExperience && (
        <EditExperienceModal
          experience={{}}
          onClose={() => setAddingExperience(false)}
          onSave={async (data: any) => {
            await addWorkExperience({ userId: profile._id, ...data, industry: "", employmentType: "permanent" });
            setAddingExperience(false);
          }}
          onDelete={null}
        />
      )}

      {/* Edit Education Modal */}
      {editingEducation && (
        <EditEducationModal
          education={editingEducation}
          onClose={() => setEditingEducation(null)}
          onSave={async (data: any) => {
            await updateEducation({ id: editingEducation._id, ...data });
            setEditingEducation(null);
          }}
          onDelete={async () => {
            if (confirm("Delete this education?")) {
              await deleteEducation({ id: editingEducation._id });
              setEditingEducation(null);
            }
          }}
        />
      )}

      {/* Add Education Modal */}
      {addingEducation && (
        <EditEducationModal
          education={{}}
          onClose={() => setAddingEducation(false)}
          onSave={async (data: any) => {
            await addEducation({ userId: profile._id, ...data });
            setAddingEducation(false);
          }}
          onDelete={null}
        />
      )}
    </DashboardLayout>
  );
}
