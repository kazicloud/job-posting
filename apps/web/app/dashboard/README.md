# Job Seeker Dashboard

Production-grade dashboard for job seekers on the Kazicloud platform.

## Structure

```
app/dashboard/
├── page.tsx                    # Dashboard home
├── jobs/
│   ├── page.tsx               # Browse jobs
│   └── [id]/page.tsx          # Job details
├── applications/page.tsx      # Track applications
├── work/page.tsx              # Contracts & engagements
├── help/page.tsx              # Career resources
└── settings/page.tsx          # Account settings

components/dashboard/
├── dashboard-layout.tsx       # Main layout wrapper
├── sidebar.tsx                # Navigation sidebar
├── page-header.tsx            # Reusable page header
├── job-list.tsx               # Job listings
├── stats-grid.tsx             # Dashboard metrics
├── recent-activity.tsx        # Activity feed
└── profile-completeness.tsx   # Profile widget
```

## Features

### Navigation
- Fixed sidebar with collapsible state
- Active route highlighting
- Icon-only collapsed mode

### Dashboard Home
- Activity stats (applications, views, saved jobs)
- Recommended job feed
- Recent activity timeline
- Profile completeness indicator

### Jobs
- Browse and search interface
- Clean job cards with key info
- Detailed job view with apply action
- Empty states

### Applications
- Table view of submitted applications
- Status tracking
- Application history

### Design Principles
- Neutral-first color palette
- Strong typography hierarchy
- Content-first layouts
- Professional, editorial feel
- No decorative UI elements

## Usage

Navigate to `/dashboard` to access the job seeker interface.

All routes are protected and require authentication (to be implemented with Clerk).

## Mock Data

Currently using mock data from `lib/mock-data.ts`. Replace with Convex queries in production.
