'use client'

import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 400

export function useJobSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  // Search with Convex
  const results = useQuery(
    api.search.searchJobs,
    debouncedQuery.length >= MIN_QUERY_LENGTH 
      ? { query: debouncedQuery } 
      : 'skip'
  )

  return {
    query,
    setQuery,
    results: results || [],
    isSearching: results === undefined && debouncedQuery.length >= MIN_QUERY_LENGTH,
    hasQuery: debouncedQuery.length >= MIN_QUERY_LENGTH,
  }
}
