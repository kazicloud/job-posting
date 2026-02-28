"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { use, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Briefcase, Building2, Users, TrendingUp, X, AlertCircle, ChevronRight, CheckCircle, Eye, Share2 } from "lucide-react";
import { ShareButton } from "@/components/share-button";

export default function PublicJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const jobId = id as Id<"jobs">;
  const job = useQuery(api.jobs.getPublic, { id: jobId });
  const insights = useQuery(api.analytics.getJobInsights, { jobId });

  if (job === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (job === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Available</h1>
          <p className="text-gray-600 mb-6">This position is no longer accepting applications.</p>
          <Link href="/jobs" className="inline-block px-6 py-3 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange/90">
            Explore Open Positions
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline).getTime() < Date.now();
  const isClosed = job.status === "closed";
  
  const getDaysLeft = () => {
    if (!job.applicationDeadline) return null;
    const deadline = new Date(job.applicationDeadline).getTime();
    const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : null;
  };

  const daysLeft = getDaysLeft();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{job.companyName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{job.companyName}</p>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span className="capitalize">{job.employmentType.replace('-', ' ')}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span className="capitalize">{job.workplaceType}</span>
                </div>
                {daysLeft && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1.5 text-orange-600 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>{daysLeft}d left</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3">
                <ShareButton 
                  jobId={jobId} 
                  jobTitle={job.title} 
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                />
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this role</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* What you'll do */}
            {job.responsibilities && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">What you'll do</h2>
                <ul className="space-y-3">
                  {job.responsibilities.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{line.replace(/^[•\-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What we're looking for */}
            {job.requirements && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">What we're looking for</h2>
                <ul className="space-y-3">
                  {job.requirements.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{line.replace(/^[•\-]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="sticky top-20 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              {!isExpired && !isClosed ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Ready to apply?</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">Join Kazicloud</p>
                    <p className="text-sm text-gray-600">Create your profile in 2 minutes</p>
                  </div>
                  <Link
                    href="/sign-up"
                    className="block w-full py-3.5 bg-brand-orange text-white text-center font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors mb-3"
                  >
                    Create Account & Apply
                  </Link>
                  <p className="text-xs text-center text-gray-500">
                    Already have an account? <Link href="/sign-in" className="text-brand-orange hover:underline">Sign in</Link>
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">Applications Closed</p>
                  <p className="text-sm text-gray-600">This position is no longer accepting applications</p>
                </div>
              )}
            </div>

            {/* Job Stats */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Job insights</h3>
              {insights ? (
                <div className="space-y-4">
                  {insights.viewCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{insights.viewCount} views</p>
                        <p className="text-xs text-gray-600">
                          {insights.isPopular ? "High interest" : "Growing interest"}
                        </p>
                      </div>
                    </div>
                  )}
                  {insights.applicationCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{insights.applicationCount} applicants</p>
                        <p className="text-xs text-gray-600">
                          {insights.competitiveness === "high" ? "Highly competitive" : 
                           insights.competitiveness === "medium" ? "Moderately competitive" : 
                           "Be among the first"}
                        </p>
                      </div>
                    </div>
                  )}
                  {insights.isNew && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{insights.applicationCount} applicants</p>
                        <p className="text-xs text-gray-600">
                          {insights.applicationCount === 0 ? "Be the first to apply" : "Active applications"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Loading insights...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">About {job.companyName}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Learn more about this company and their open positions.
              </p>
              <Link href="/sign-up" className="text-sm text-brand-orange font-medium hover:underline">
                View company profile →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Find your next opportunity on Kazicloud
            </h2>
            <p className="text-gray-300 mb-8">
              Join thousands of professionals who've found their dream jobs through our platform
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-orange/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/jobs"
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
