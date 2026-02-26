export function getRoleDashboard(primaryRole: string): string {
  switch (primaryRole) {
    case "employer":
      return "/employer-dashboard";
    case "recruiter":
      return "/recruiter-dashboard"; // Future
    case "job_seeker":
    default:
      return "/dashboard";
  }
}

export function canAccessRoute(userRole: string, path: string): boolean {
  // Employer routes
  if (path.startsWith("/employer-dashboard")) {
    return userRole === "employer";
  }
  
  // Job seeker routes
  if (path.startsWith("/dashboard") && !path.startsWith("/employer-dashboard")) {
    return userRole === "job_seeker";
  }
  
  // Recruiter routes (future)
  if (path.startsWith("/recruiter-dashboard")) {
    return userRole === "recruiter";
  }
  
  return true; // Allow access to other routes
}
