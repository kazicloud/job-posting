"use client";

import { useState, useEffect } from "react";
import { TrendingUp, MapPin, History, ArrowRight, Search } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

interface SearchDropdownProps {
  isOpen: boolean;
  query: string;
  setQuery: (query: string) => void;
  onClose: () => void;
}

export function SearchDropdown({ isOpen, query, setQuery, onClose }: SearchDropdownProps) {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent
  const saveSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Clear query when closed
  useEffect(() => {
    if (!isOpen) {
      setDebouncedQuery("");
    }
  }, [isOpen]);

  const searchResults = useQuery(
    api.search.searchJobs,
    debouncedQuery.length >= 2 ? { query: debouncedQuery, limit: 8 } : "skip"
  );

  const suggestions = useQuery(
    api.search.getSearchSuggestions,
    query.length >= 2 && query.length < 3 ? { query } : "skip"
  );

  if (!isOpen) return null;

  const hasResults = searchResults && searchResults.length > 0;
  const showSuggestions = suggestions && suggestions.length > 0 && !debouncedQuery;

  const popularSearches = ["Software Engineer", "Product Manager", "Data Analyst", "UI/UX Designer", "Marketing Manager", "Sales Executive"];

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
      {/* Results */}
      <div className="max-h-[70vh] overflow-y-auto">
        {!query && (
          <div className="p-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <History className="w-4 h-4 text-neutral-text-muted" />
                  <h3 className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wide">Recent</h3>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(term)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-neutral-bg-secondary rounded-lg transition-colors text-left group"
                    >
                      <span className="text-sm text-neutral-text">{term}</span>
                      <ArrowRight className="w-4 h-4 text-neutral-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-2">
                <TrendingUp className="w-4 h-4 text-neutral-text-muted" />
                <h3 className="text-xs font-semibold text-neutral-text-muted uppercase tracking-wide">Popular</h3>
              </div>
              <div className="space-y-1">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-neutral-bg-secondary rounded-lg transition-colors text-left group"
                  >
                    <span className="text-sm text-neutral-text">{term}</span>
                    <ArrowRight className="w-4 h-4 text-neutral-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="p-4">
            <div className="space-y-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-bg-secondary rounded-lg transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-neutral-text-muted flex-shrink-0" />
                  <span className="text-sm text-neutral-text">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {debouncedQuery && !hasResults && searchResults !== undefined && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-neutral-bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-neutral-text-muted" />
            </div>
            <h3 className="text-base font-semibold text-neutral-text mb-1">
              No jobs found
            </h3>
            <p className="text-sm text-neutral-text-secondary">
              Try adjusting your search or browse all jobs
            </p>
          </div>
        )}

        {hasResults && (
          <div className="p-4">
            <div className="mb-2 px-2">
              <p className="text-xs text-neutral-text-muted">
                {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
              </p>
            </div>
            <div className="space-y-1">
              {searchResults.map((job) => (
                <Link
                  key={job._id}
                  href={`/dashboard/jobs/${job._id}`}
                  onClick={() => {
                    saveSearch(query);
                    onClose();
                  }}
                  className="block p-3 hover:bg-neutral-bg-secondary rounded-lg transition-colors group"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-neutral-bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {job.employerProfile?.companyLogo ? (
                        <img 
                          src={job.employerProfile.companyLogo} 
                          alt={`${job.companyName} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-neutral-text">
                          {job.companyName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-neutral-text mb-0.5 group-hover:text-brand-orange transition-colors truncate">
                        {job.title}
                      </h4>
                      <p className="text-xs text-neutral-text-secondary mb-1.5 truncate">
                        {job.companyName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span>{job.employmentType.replace("-", " ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-neutral-text-muted group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {searchResults.length >= 8 && (
              <div className="mt-3 pt-3 border-t border-neutral-border">
                <Link
                  href={`/dashboard/jobs?search=${encodeURIComponent(query)}`}
                  onClick={() => {
                    saveSearch(query);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-brand-orange hover:bg-brand-orange/5 rounded-lg transition-colors"
                >
                  View all results
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {debouncedQuery && searchResults === undefined && (
          <div className="p-4 space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-1.5" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
