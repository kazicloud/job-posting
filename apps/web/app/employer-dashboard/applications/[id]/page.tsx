"use client";

import { EmployerDashboardLayout } from "@/components/employer-dashboard/employer-dashboard-layout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Download,
  Share2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  Award,
  Building2,
  Link2
} from "lucide-react";

// Helper function to calculate duration
function calculateDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years === 0) return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const applicationId = id as Id<"applications">;
  
  const application = useQuery(api.applications.getApplicationById, { applicationId });
  const notes = useQuery(api.applications.getApplicationNotes, { applicationId });
  const updateStatus = useMutation(api.applications.updateStatus);
  const addNote = useMutation(api.applications.addApplicationNote);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  if (!application) {
    return (
      <EmployerDashboardLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  const { jobSeeker, job } = application;

  if (!jobSeeker || !job) {
    return (
      <EmployerDashboardLayout>
        <div className="p-8">
          <div className="text-center">
            <p className="text-neutral-text-secondary">Application not found</p>
          </div>
        </div>
      </EmployerDashboardLayout>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatus({ applicationId, status: newStatus as any });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    
    setIsSavingNote(true);
    try {
      await addNote({ applicationId, note: note.trim() });
      setNote("");
      setShowNoteForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-50 text-blue-700 border-blue-200";
      case "shortlisted": return "bg-purple-50 text-purple-700 border-purple-200";
      case "interview": return "bg-orange-50 text-orange-700 border-orange-200";
      case "accepted": return "bg-green-50 text-green-700 border-green-200";
      case "rejected": return "bg-gray-50 text-gray-700 border-gray-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <Clock className="w-4 h-4" />;
      case "shortlisted": return <CheckCircle2 className="w-4 h-4" />;
      case "interview": return <Calendar className="w-4 h-4" />;
      case "accepted": return <CheckCircle2 className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const matchedSkills = job.requiredSkills?.filter(skill => 
    jobSeeker.skills?.some(js => js.toLowerCase().includes(skill.toLowerCase()))
  ) || [];
  
  const missingSkills = job.requiredSkills?.filter(skill => 
    !jobSeeker.skills?.some(js => js.toLowerCase().includes(skill.toLowerCase()))
  ) || [];

  return (
    <EmployerDashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Top Bar */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/employer-dashboard/applications"
                className="inline-flex items-center gap-2 text-neutral-text-secondary hover:text-neutral-text transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium">Back to Applications</span>
              </Link>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors">
                  <Download className="w-4 h-4 text-neutral-text-secondary" />
                </button>
                <button className="p-2 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors">
                  <Share2 className="w-4 h-4 text-neutral-text-secondary" />
                </button>
                <button className="p-2 border border-neutral-border rounded-lg hover:bg-neutral-bg-secondary transition-colors">
                  <MoreVertical className="w-4 h-4 text-neutral-text-secondary" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Candidate Header */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold text-white">
                    {jobSeeker.name?.split(" ").map(n => n[0]).join("") || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-neutral-text">{jobSeeker.name}</h1>
                      {application.matchScore > 0 && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${
                          application.matchScore >= 80 ? "bg-green-50 text-green-700" :
                          application.matchScore >= 60 ? "bg-yellow-50 text-yellow-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {application.matchScore}% Match
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-text-secondary mb-4">
                      {jobSeeker.email && (
                        <a href={`mailto:${jobSeeker.email}`} className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                          <Mail className="w-4 h-4" />
                          {jobSeeker.email}
                        </a>
                      )}
                      {jobSeeker.phone && (
                        <a href={`tel:${jobSeeker.phone}`} className="flex items-center gap-1 hover:text-brand-orange transition-colors">
                          <Phone className="w-4 h-4" />
                          {jobSeeker.phone}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message Candidate
                      </button>
                      <button className="px-4 py-2 border border-neutral-border text-neutral-text text-sm font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule Interview
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {application.coverLetter && (
                <div className="bg-white border border-neutral-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-text mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Cover Letter
                  </h3>
                  <p className="text-neutral-text-secondary whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              )}

              {/* Skills & Match */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-text mb-4">Skills & Match</h3>
                
                {matchedSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-text mb-2">Matched Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {matchedSkills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
                          <CheckCircle2 className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {missingSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-text mb-2">Missing Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                          <XCircle className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-neutral-text mb-2">Additional Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {jobSeeker.skills
                        .filter(skill => !job.requiredSkills?.some(rs => skill.toLowerCase().includes(rs.toLowerCase())))
                        .map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded-lg border border-gray-200">
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">from profile</span>
                </div>
                
                {jobSeeker.workExperience && jobSeeker.workExperience.length > 0 ? (
                  <div className="space-y-6">
                    {jobSeeker.workExperience.map((exp: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-text">{exp.jobTitle}</h4>
                          <p className="text-sm text-neutral-text-secondary">{exp.company}</p>
                          <p className="text-xs text-neutral-text-muted mt-1">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} - {' '}
                            {exp.currentlyWorking ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            {exp.startDate && (exp.currentlyWorking || exp.endDate) && (
                              <span className="ml-2">
                                ({calculateDuration(exp.startDate, exp.currentlyWorking ? new Date().toISOString() : exp.endDate)})
                              </span>
                            )}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-neutral-text-secondary mt-2 whitespace-pre-wrap">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-text-muted">No work experience added to profile</p>
                )}
              </div>

              {/* Education */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Education
                  </h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">from profile</span>
                </div>
                
                {jobSeeker.education && jobSeeker.education.length > 0 ? (
                  <div className="space-y-6">
                    {jobSeeker.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-text capitalize">{edu.qualificationLevel} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h4>
                          <p className="text-sm text-neutral-text-secondary">{edu.institution}</p>
                          <p className="text-xs text-neutral-text-muted mt-1">
                            {edu.startYear} - {edu.endYear}
                          </p>
                          {edu.grade && (
                            <p className="text-sm text-neutral-text-secondary mt-1">Grade: {edu.grade}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-text-muted">No education added to profile</p>
                )}
              </div>

              {/* Certifications */}
              {jobSeeker.certifications && jobSeeker.certifications.length > 0 && (
                <div className="bg-white border border-neutral-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Certifications
                    </h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">from profile</span>
                  </div>
                  
                  <div className="space-y-4">
                    {jobSeeker.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-text">{cert.name}</h4>
                          <p className="text-sm text-neutral-text-secondary">{cert.issuingOrganization}</p>
                          <p className="text-xs text-neutral-text-muted mt-1">
                            Issued {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            {cert.expiryDate && !cert.doesNotExpire && ` • Expires ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                            {cert.doesNotExpire && ' • No expiration'}
                          </p>
                          {cert.credentialUrl && (
                            <a 
                              href={cert.credentialUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-brand-orange hover:underline mt-1 inline-flex items-center gap-1"
                            >
                              View credential <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <div className="bg-white border border-neutral-border rounded-lg p-6 sticky top-20">
                <h3 className="text-sm font-semibold text-neutral-text mb-4">Application Status</h3>
                
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-4 py-2.5 border border-neutral-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white mb-4"
                >
                  <option value="submitted">Submitted</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Regret</option>
                </select>

                {/* Timeline */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-text capitalize">{application.status.replace('_', ' ')}</p>
                      <p className="text-xs text-neutral-text-muted">
                        {new Date(application._creationTime).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  {application.status === "submitted" && (
                    <button
                      onClick={() => handleStatusChange("shortlisted")}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Move to Shortlist
                    </button>
                  )}
                  {application.status === "shortlisted" && (
                    <button
                      onClick={() => handleStatusChange("interview")}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Interview
                    </button>
                  )}
                  {application.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange("rejected")}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 border border-red-600 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Regret Application
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="bg-white border border-neutral-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-neutral-text mb-4">Internal Notes</h3>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="w-full px-4 py-2 border border-neutral-border text-neutral-text text-sm font-medium rounded-lg hover:bg-neutral-bg-secondary transition-colors"
                >
                  + Add Note
                </button>
                {showNoteForm && (
                  <div className="mt-4">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a private note about this candidate..."
                      className="w-full px-3 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={handleSaveNote}
                        disabled={isSavingNote || !note.trim()}
                        className="px-3 py-1.5 bg-brand-orange text-white text-sm font-medium rounded-lg hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingNote ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          setShowNoteForm(false);
                          setNote("");
                        }}
                        disabled={isSavingNote}
                        className="px-3 py-1.5 border border-neutral-border text-neutral-text text-sm font-medium rounded-lg hover:bg-neutral-bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-4 space-y-3">
                  {notes && notes.length > 0 ? (
                    notes.map((noteItem) => (
                      <div key={noteItem._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-semibold text-neutral-text">{noteItem.authorName}</span>
                          <span className="text-xs text-neutral-text-muted">
                            {new Date(noteItem._creationTime).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-text-secondary whitespace-pre-wrap">{noteItem.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-text-muted">No notes yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </EmployerDashboardLayout>
  );
}
