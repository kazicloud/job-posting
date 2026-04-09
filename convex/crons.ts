import { cronJobs } from 'convex/server'
import { api } from './_generated/api'

const crons = cronJobs()

// Run every hour to expire old jobs
crons.interval(
  'expire-old-jobs',
  { hours: 1 },
  api.jobs.expireOldJobs
)

export default crons
