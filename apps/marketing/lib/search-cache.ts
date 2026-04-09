// Simple in-memory cache for search results
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const searchCache = {
  get: (key: string) => {
    const cached = cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      cache.delete(key)
      return null
    }
    
    return cached.data
  },
  
  set: (key: string, data: any) => {
    cache.set(key, { data, timestamp: Date.now() })
    
    // Cleanup old entries if cache gets too large
    if (cache.size > 100) {
      const entries = Array.from(cache.entries())
      const oldest = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
      if (oldest) {
        cache.delete(oldest[0])
      }
    }
  },
  
  clear: () => cache.clear()
}
