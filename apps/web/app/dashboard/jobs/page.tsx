"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { WishlistButton } from "@/components/wishlist-button";
import { ShareButton } from "@/components/share-button";
import { useState } from "react";
import { Search, MapPin, Clock, Briefcase, DollarSign, Share2, Bookmark, ChevronDown, Building2, Home, Laptop, Award, Calendar, Users, Eye, CheckCircle2, Building, Clock4, Sparkles, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import Link from "next/link";

export default function JobsPage() {
  const profile = useQuery(api.profile.getCurrentUserProfile);
  const [activeTab, setActiveTab] = useState<"field" | "all">("field");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [paginationOpts, setPaginationOpts] = useState({ numItems: 20, cursor: null as string | null });
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "salary-high" | "salary-low">("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedWorkType, setSelectedWorkType] = useState<string>("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>("");
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>("");
  const [salaryRange, setSalaryRange] = useState<{ min: number; max: number } | null>(null);
  
  // Modal states
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // Query based on active tab
  const fieldJobsResult = useQuery(
    api.recommendations.getSmartRecommendationsPaginated, 
    activeTab === "field" ? { paginationOpts } : "skip"
  );
  const allJobsResult = useQuery(
    api.jobs.listPublished, 
    activeTab === "all" ? { paginationOpts } : "skip"
  );

  const result = activeTab === "field" ? fieldJobsResult : allJobsResult;
  const jobs = result?.page || [];
  const isLoading = result === undefined;

  // Get user's interested fields for personalized tab
  const userFields = profile?.jobSeekerProfile?.interestedFields || ["Technology"];
  const userField = userFields[0];

  const loadMore = () => {
    if (result && !result.isDone) {
      setPaginationOpts({ numItems: 20, cursor: result.continueCursor });
    }
  };

  // Reset pagination when switching tabs
  const handleTabChange = (tab: "field" | "all") => {
    setActiveTab(tab);
    setPaginationOpts({ numItems: 20, cursor: null });
  };

  // Filter jobs by search query and filters
  const filteredJobs = jobs.filter(job => {
    // Search filter
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.department && job.department.toLowerCase().includes(searchQuery.toLowerCase()));

    // Skills filter
    const matchesSkills = selectedSkills.length === 0 || 
      (job.requiredSkills && selectedSkills.some(skill => 
        job.requiredSkills?.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      ));

    // Location filter
    const matchesLocation = !selectedLocation || 
      job.location.toLowerCase().includes(selectedLocation.toLowerCase());

    // Work type filter
    const matchesWorkType = !selectedWorkType || 
      job.workplaceType.toLowerCase() === selectedWorkType.toLowerCase();

    // Employment type filter
    const matchesEmploymentType = !selectedEmploymentType || 
      job.employmentType.toLowerCase() === selectedEmploymentType.toLowerCase();

    // Experience level filter
    const matchesExperience = !selectedExperienceLevel || 
      job.experienceLevel.toLowerCase() === selectedExperienceLevel.toLowerCase();

    // Salary range filter
    const matchesSalary = !salaryRange || 
      (job.salaryMin && job.salaryMax && 
        job.salaryMin >= salaryRange.min && 
        job.salaryMax <= salaryRange.max);

    return matchesSearch && matchesSkills && matchesLocation && 
           matchesWorkType && matchesEmploymentType && matchesExperience && matchesSalary;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.createdAt - a.createdAt;
      case "oldest":
        return a.createdAt - b.createdAt;
      case "salary-high":
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      case "salary-low":
        return (a.salaryMin || 0) - (b.salaryMin || 0);
      default:
        return 0;
    }
  });

  // Get unique values for filter dropdowns
  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location))).sort();
  const uniqueSkills = Array.from(new Set(jobs.flatMap(j => j.requiredSkills || []))).sort();

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setSelectedLocation("");
    setSelectedWorkType("");
    setSelectedEmploymentType("");
    setSelectedExperienceLevel("");
    setSalaryRange(null);
  };

  const hasActiveFilters = searchQuery || selectedSkills.length > 0 || selectedLocation || 
    selectedWorkType || selectedEmploymentType || selectedExperienceLevel || salaryRange;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-neutral-bg-secondary">
        {/* Header with Tabs */}
        <div className="bg-white border-b border-neutral-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
            <div className="flex items-center gap-4 sm:gap-8 mb-4 sm:mb-6 overflow-x-auto">
              <button
                onClick={() => handleTabChange("field")}
                className={`pb-3 sm:pb-4 text-base sm:text-lg font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === "field"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Recommended for you</span>
                <span className="sm:hidden">For You</span>
              </button>
              <button
                onClick={() => handleTabChange("all")}
                className={`pb-3 sm:pb-4 text-base sm:text-lg font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "all"
                    ? "border-neutral-text text-neutral-text"
                    : "border-transparent text-neutral-text-muted hover:text-neutral-text"
                }`}
              >
                All jobs
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b border-neutral-border sticky top-0 z-10 overflow-visible">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-text-muted" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                />
              </div>

              {/* Filter Buttons - Horizontal scroll on mobile */}
              <div className="flex items-center gap-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
                <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setOpenFilter(openFilter === "skills" ? null : "skills")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedSkills.length > 0
                        ? "bg-neutral-text text-white border-neutral-text"
                        : "border-neutral-border text-neutral-text hover:bg-neutral-bg-secondary"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Skills</span>
                    {selectedSkills.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
                        {selectedSkills.length}
                      </span>
                    )}
                  </button>
                  {openFilter === "skills" && (
                    <FilterDropdown
                      title="Skills"
                      items={uniqueSkills}
                      selectedItems={selectedSkills}
                      onToggle={(skill) => {
                        setSelectedSkills(prev =>
                          prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                        );
                      }}
                      onClear={() => setSelectedSkills([])}
                      onClose={() => setOpenFilter(null)}
                      searchValue={filterSearch}
                    onSearchChange={setFilterSearch}
                  />
                )}
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenFilter(openFilter === "location" ? null : "location")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedLocation
                      ? "bg-neutral-text text-white border-neutral-text"
                      : "border-neutral-border text-neutral-text hover:bg-neutral-bg-secondary"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Location</span>
                  {selectedLocation && <span className="text-xs">✓</span>}
                </button>
                {openFilter === "location" && (
                  <FilterDropdown
                    title="Location"
                    items={uniqueLocations}
                    selectedItems={selectedLocation ? [selectedLocation] : []}
                    onToggle={(loc) => setSelectedLocation(selectedLocation === loc ? "" : loc)}
                    onClear={() => setSelectedLocation("")}
                    onClose={() => setOpenFilter(null)}
                    searchValue={filterSearch}
                    onSearchChange={setFilterSearch}
                    singleSelect
                  />
                )}
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenFilter(openFilter === "workType" ? null : "workType")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedWorkType
                      ? "bg-neutral-text text-white border-neutral-text"
                      : "border-neutral-border text-neutral-text hover:bg-neutral-bg-secondary"
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Work Type</span>
                  {selectedWorkType && <span className="text-xs">✓</span>}
                </button>
                {openFilter === "workType" && (
                  <FilterDropdown
                    title="Work Type"
                    items={["Remote", "On-site", "Hybrid"]}
                    selectedItems={selectedWorkType ? [selectedWorkType] : []}
                    onToggle={(type) => setSelectedWorkType(selectedWorkType === type.toLowerCase() ? "" : type.toLowerCase())}
                    onClear={() => setSelectedWorkType("")}
                    onClose={() => setOpenFilter(null)}
                    singleSelect
                  />
                )}
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenFilter(openFilter === "jobType" ? null : "jobType")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedEmploymentType
                      ? "bg-neutral-text text-white border-neutral-text"
                      : "border-neutral-border text-neutral-text hover:bg-neutral-bg-secondary"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Job Type</span>
                  {selectedEmploymentType && <span className="text-xs">✓</span>}
                </button>
                {openFilter === "jobType" && (
                  <FilterDropdown
                    title="Job Type"
                    items={["Full-time", "Part-time", "Contract", "Internship"]}
                    selectedItems={selectedEmploymentType ? [selectedEmploymentType] : []}
                    onToggle={(type) => setSelectedEmploymentType(selectedEmploymentType === type.toLowerCase() ? "" : type.toLowerCase())}
                    onClear={() => setSelectedEmploymentType("")}
                    onClose={() => setOpenFilter(null)}
                    singleSelect
                  />
                )}
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setOpenFilter(openFilter === "experience" ? null : "experience")}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedExperienceLevel
                      ? "bg-neutral-text text-white border-neutral-text"
                      : "border-neutral-border text-neutral-text hover:bg-neutral-bg-secondary"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Experience</span>
                  {selectedExperienceLevel && <span className="text-xs">✓</span>}
                </button>
                {openFilter === "experience" && (
                  <FilterDropdown
                    title="Experience Level"
                    items={["Entry Level", "Mid Level", "Senior", "Lead", "Executive"]}
                    selectedItems={selectedExperienceLevel ? [selectedExperienceLevel] : []}
                    onToggle={(level) => {
                      const levelMap: Record<string, string> = {
                        "Entry Level": "entry",
                        "Mid Level": "mid",
                        "Senior": "senior",
                        "Lead": "lead",
                        "Executive": "executive"
                      };
                      const value = levelMap[level] || "";
                      setSelectedExperienceLevel(selectedExperienceLevel === value ? "" : value);
                    }}
                    onClear={() => setSelectedExperienceLevel("")}
                    onClose={() => setOpenFilter(null)}
                    singleSelect
                  />
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
                >
                  Clear all
                </button>
              )}
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <p className="text-sm text-neutral-text-secondary">
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  <span className="font-semibold text-neutral-text">{sortedJobs.length}</span> job{sortedJobs.length !== 1 ? 's' : ''} 
                  {activeTab === "field" && " recommended for you"}
                </>
              )}
            </p>
            <div className="flex items-center gap-2 relative">
              <span className="text-sm text-neutral-text-secondary hidden sm:inline">Sorted by</span>
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-1 text-sm font-medium text-neutral-text hover:text-brand-orange"
              >
                {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : sortBy === "salary-high" ? "Salary: High to Low" : "Salary: Low to High"}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                  <div className="fixed sm:absolute right-4 sm:right-0 top-[180px] sm:top-full sm:mt-2 w-48 bg-white border border-neutral-border rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => { setSortBy("newest"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "newest" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => { setSortBy("oldest"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "oldest" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Oldest
                    </button>
                    <button
                      onClick={() => { setSortBy("salary-high"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "salary-high" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Salary: High to Low
                    </button>
                    <button
                      onClick={() => { setSortBy("salary-low"); setShowSortMenu(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-bg-secondary transition-colors ${
                        sortBy === "salary-low" ? "text-brand-orange font-medium" : "text-neutral-text"
                      }`}
                    >
                      Salary: Low to High
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading Skeletons
              <>
                {[1, 2, 3, 4].map((i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </>
            ) : sortedJobs.length === 0 ? (
              <div className="bg-white border border-neutral-border rounded-lg p-12 text-center">
                <p className="text-neutral-text-secondary mb-2">
                  {activeTab === "field" 
                    ? "No recommended jobs found" 
                    : searchQuery 
                    ? "No jobs match your search" 
                    : "No jobs available"}
                </p>
                {activeTab === "field" && (
                  <p className="text-sm text-neutral-text-muted">
                    Complete your profile and add skills to get personalized recommendations
                  </p>
                )}
              </div>
            ) : (
              <>
                {sortedJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    id={job._id}
                    company={job.companyName}
                    employerId={job.employerId}
                    title={job.title}
                    department={job.department}
                    requiredSkills={job.requiredSkills}
                    location={job.location}
                    workType={job.workplaceType}
                    employmentType={job.employmentType}
                    experienceLevel={job.experienceLevel}
                    applicationDeadline={job.applicationDeadline}
                    salary={
                      job.salaryDisclosure === "range" && job.salaryMin && job.salaryMax
                        ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                        : job.salaryDisclosure === "negotiable"
                        ? "Competitive salary"
                        : "To be discussed"
                    }
                    createdAt={job.createdAt}
                    isExpanded={expandedJob === job._id}
                    onToggleExpand={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                  />
                ))}
                
                {result && !result.isDone && (
                  <div className="flex justify-center pt-6">
                    <button
                      onClick={loadMore}
                      className="px-6 py-3 border border-neutral-border text-neutral-text rounded-md hover:bg-neutral-bg-secondary transition-colors"
                    >
                      Load More Jobs
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function JobCard({
  id,
  company,
  employerId,
  title,
  department,
  requiredSkills,
  location,
  workType,
  employmentType,
  experienceLevel,
  applicationDeadline,
  salary,
  createdAt,
  isExpanded,
  onToggleExpand,
}: {
  id: string;
  company: string;
  employerId: string;
  title: string;
  department?: string;
  requiredSkills?: string[];
  location: string;
  workType: string;
  employmentType: string;
  experienceLevel: string;
  applicationDeadline?: string;
  salary: string;
  createdAt: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  // Fetch employer profile for company stats
  const employerProfile = useQuery(api.profile.getEmployerProfile, { userId: employerId as any });
  
  // Fetch skill match for this job
  const skillMatch = useQuery(api.matching.calculateSkillMatch, { jobId: id as any });
  
  // Fetch real analytics
  const jobAnalytics = useQuery(api.analytics.getJobAnalytics, { jobId: id as any });
  
  const applicantCount = jobAnalytics?.applicationCount || 0;
  const viewCount = jobAnalytics?.viewCount || 0;

  // Color and display helpers
  const logo = company.charAt(0).toUpperCase();
  const bgColors = ['bg-[#E8F5E3]', 'bg-[#F3E8F8]', 'bg-[#FCE8E8]', 'bg-[#E8F0FC]', 'bg-[#FFF9E6]'];
  const textColors = ['text-[#4A7C3B]', 'text-[#7B4A9E]', 'text-[#C84A4A]', 'text-[#4A6FA5]', 'text-[#B8860B]'];
  const colorIndex = company.length % bgColors.length;

  const isNew = Date.now() - createdAt < 48 * 60 * 60 * 1000;

  const getDaysLeft = () => {
    if (!applicationDeadline) return null;
    const deadline = new Date(applicationDeadline).getTime();
    const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : null;
  };

  const daysLeft = getDaysLeft();

  const getWorkplaceIcon = () => {
    switch (workType.toLowerCase()) {
      case 'remote':
        return <Home className="w-4 h-4" />;
      case 'hybrid':
        return <Laptop className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const formatExperience = (level: string) => {
    const map: Record<string, string> = {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior",
      lead: "Lead",
      executive: "Executive"
    };
    return map[level] || level;
  };
  
  return (
    <div className="bg-white border border-neutral-border rounded-xl p-4 sm:p-6 hover:shadow-md transition-all overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Company Logo */}
        <div className={`w-full sm:w-[120px] lg:w-[148px] h-[100px] sm:h-[140px] lg:h-[160px] ${bgColors[colorIndex]} rounded-2xl flex flex-col items-center justify-center flex-shrink-0 p-3 sm:p-4`}>
          <span className={`text-xs sm:text-sm font-semibold ${textColors[colorIndex]} mb-2 sm:mb-3 text-center truncate w-full px-2`}>{company}</span>
          <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-[#E8FF00] rounded-xl flex items-center justify-center overflow-hidden">
            {employerProfile?.companyLogo ? (
              <img 
                src={employerProfile.companyLogo} 
                alt={`${company} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-text">{logo}</span>
            )}
          </div>
        </div>

        {/* Job Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Tags and Actions */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-[#FFE4C4] text-neutral-text capitalize flex items-center gap-1 sm:gap-1.5">
                <Clock4 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                {employmentType}
              </span>
              {department && (
                <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-[#E8F0FC] text-neutral-text capitalize flex items-center gap-1 sm:gap-1.5">
                  <Briefcase className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  {department}
                </span>
              )}
              {isNew && <span className="px-2 py-1 text-xs font-semibold text-[#EF4444]">New</span>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {daysLeft !== null && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-md">
                  <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">
                    {daysLeft}d
                  </span>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2">
                <ShareButton jobId={id as any} jobTitle={title} />
                <WishlistButton jobId={id as any} />
              </div>
            </div>
          </div>

          {/* Title and Salary */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-3">
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-text hover:text-brand-orange cursor-pointer leading-tight flex-1 break-words">
              {title}
            </h3>
            <p className="text-base sm:text-xl font-semibold text-neutral-text whitespace-nowrap flex-shrink-0">{salary}</p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-text-secondary mb-4 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <MapPin className="w-4 sm:w-4 h-4 sm:h-4" />
              <span className="truncate max-w-[120px] sm:max-w-none">{location}</span>
            </div>
            {workType.toLowerCase() !== 'remote' && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {getWorkplaceIcon()}
                <span className="capitalize hidden sm:inline">{workType}</span>
              </div>
            )}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              <span className="hidden sm:inline">{formatExperience(experienceLevel)}</span>
              <span className="sm:hidden">{experienceLevel}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 hidden sm:flex">
              <Clock className="w-4 h-4" />
              <span>Posted: {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2 mb-4">
            <ShareButton jobId={id as any} jobTitle={title} />
            <WishlistButton jobId={id as any} />
          </div>

          {/* Separator */}
          <div className="border-t border-neutral-border my-3 sm:my-4"></div>

          {/* Skills Tags and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {requiredSkills && requiredSkills.length > 0 ? (
                requiredSkills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-text-muted">No skills specified</span>
              )}
              {requiredSkills && requiredSkills.length > 3 && (
                <span className="text-xs text-neutral-text-muted">+{requiredSkills.length - 3} more</span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
              <Link
                href={`/dashboard/jobs/${id}`}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
              >
                <span>View job</span>
                <span className="text-lg">→</span>
              </Link>
              <button
                onClick={onToggleExpand}
                className="hidden sm:flex text-sm font-medium text-neutral-text hover:text-brand-orange items-center gap-1"
              >
                Expand
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-neutral-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Quick Stats */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-text mb-3">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                      <Users className="w-4 h-4" />
                      <span>{applicantCount} applicants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                      <Eye className="w-4 h-4" />
                      <span>{viewCount} views</span>
                    </div>
                    {daysLeft && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Calendar className="w-4 h-4" />
                        <span>{daysLeft} days remaining</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Info */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-text mb-3">Company Info</h4>
                  <div className="space-y-2">
                    {employerProfile?.companySize && (
                      <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                        <Building className="w-4 h-4" />
                        <span>{employerProfile.companySize}</span>
                      </div>
                    )}
                    {employerProfile?.headquarters && (
                      <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                        <MapPin className="w-4 h-4" />
                        <span>{employerProfile.headquarters}, {employerProfile.country || 'Kenya'}</span>
                      </div>
                    )}
                    {employerProfile?.companyIndustries && employerProfile.companyIndustries.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-neutral-text-secondary">
                        <Briefcase className="w-4 h-4" />
                        <span>{employerProfile.companyIndustries.join(', ')}</span>
                      </div>
                    )}
                    {!employerProfile && (
                      <p className="text-xs text-neutral-text-muted italic">Loading company info...</p>
                    )}
                  </div>
                </div>

                {/* Match Indicator */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-text mb-3">Your Match</h4>
                  {skillMatch ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <CheckCircle2
                              key={i}
                              className={`w-4 h-4 ${i < skillMatch.matchScore ? 'text-green-500 fill-green-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-neutral-text">{skillMatch.matchScore}/5</span>
                      </div>
                      <p className="text-xs text-neutral-text-secondary mb-2">
                        You match {skillMatch.matchedCount} of {skillMatch.totalRequired} required skills ({skillMatch.matchPercentage}%)
                      </p>
                      {skillMatch.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {skillMatch.matchedSkills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-neutral-text-muted italic">Add skills to your profile to see match score</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-border rounded-xl p-4 sm:p-6 animate-pulse overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Company Logo Skeleton */}
        <div className="w-full sm:w-[120px] lg:w-[148px] h-[100px] sm:h-[140px] lg:h-[160px] bg-gray-200 rounded-2xl flex-shrink-0"></div>

        {/* Job Content Skeleton */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Tags */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-16 sm:w-24"></div>
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-14 sm:w-20"></div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* Title and Salary */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-3">
            <div className="h-6 sm:h-7 bg-gray-200 rounded w-full sm:w-2/3"></div>
            <div className="h-5 sm:h-7 bg-gray-200 rounded w-24 sm:w-32"></div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 flex-wrap">
            <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-20 sm:w-28 hidden sm:block"></div>
            <div className="h-4 bg-gray-200 rounded w-24 sm:w-32 hidden sm:block"></div>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
          </div>

          {/* Separator */}
          <div className="border-t border-neutral-border my-3 sm:my-4"></div>

          {/* Skills and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-16 sm:w-20"></div>
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-20 sm:w-24"></div>
              <div className="h-6 sm:h-7 bg-gray-200 rounded-md w-16 sm:w-20"></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="h-9 bg-gray-200 rounded-lg flex-1 sm:flex-none sm:w-28"></div>
              <div className="h-5 bg-gray-200 rounded w-20 hidden sm:block"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({
  title,
  items,
  selectedItems,
  onToggle,
  onClear,
  onClose,
  searchValue,
  onSearchChange,
  singleSelect = false,
}: {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
  onClear: () => void;
  onClose: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  singleSelect?: boolean;
}) {
  const filteredItems = searchValue
    ? items.filter(item => item.toLowerCase().includes(searchValue.toLowerCase()))
    : items;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown - Fixed positioning on mobile, absolute on desktop */}
      <div className="fixed sm:absolute left-4 right-4 top-20 sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white border border-neutral-border rounded-xl shadow-lg z-50 max-h-[70vh] sm:max-h-[500px] flex flex-col">
        {/* Header with Search */}
        <div className="p-4 border-b border-neutral-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-text">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-bg-secondary rounded-md"
            >
              <X className="w-5 h-5 text-neutral-text-muted" />
            </button>
          </div>
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text-muted" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-neutral-text-muted text-center py-8">No results found</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item) || selectedItems.includes(item.toLowerCase());
                return (
                  <button
                    key={item}
                    onClick={() => onToggle(item)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-neutral-text text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-border flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClear();
              if (onSearchChange) onSearchChange("");
            }}
            className="text-sm font-medium text-neutral-text-secondary hover:text-neutral-text"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-neutral-text text-white text-sm font-semibold rounded-lg hover:bg-neutral-text/90 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
