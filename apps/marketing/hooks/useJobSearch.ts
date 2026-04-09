'use client'

import { useState, useEffect, useCallback } from 'react'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 400
const WEB_APP_URL = process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000'

// Simple cache
const cache = new Map<string, { data: any[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

export function useJobSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  // Search
  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([])
      return
    }

    const cacheKey = `search:${debouncedQuery}`
    const cached = cache.get(cacheKey)
    
    // Return cached
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setResults(cached.data)
      return
    }

    // Fetch
    setIsSearching(true)
    fetch(`${WEB_APP_URL}/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => res.json())
      .then(data => {
        cache.set(cacheKey, { data, timestamp: Date.now() })
        setResults(data)
        setIsSearching(false)
      })
      .catch(() => {
        setResults([])
        setIsSearching(false)
      })
  }, [debouncedQuery])

  const clearSearch = useCallback(() => {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
  }, [])

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasQuery: debouncedQuery.length >= MIN_QUERY_LENGTH,
    clearSearch,
  }
}
