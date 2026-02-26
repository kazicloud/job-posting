import { create } from 'zustand';

interface SignUpState {
  username: string;
  selectedRoles: string[];
  setUsername: (username: string) => void;
  setSelectedRoles: (roles: string[]) => void;
  toggleRole: (role: string) => void;
  reset: () => void;
}

export const useSignUpStore = create<SignUpState>((set) => ({
  username: '',
  selectedRoles: [],
  setUsername: (username) => set({ username }),
  setSelectedRoles: (roles) => set({ selectedRoles: roles }),
  toggleRole: (role) => set((state) => {
    const currentRoles = state.selectedRoles;
    
    // If role is already selected, remove it
    if (currentRoles.includes(role)) {
      return { selectedRoles: currentRoles.filter(r => r !== role) };
    }
    
    // Check if trying to select both job_seeker and employer
    if (role === 'job_seeker' && currentRoles.includes('employer')) {
      return { selectedRoles: [role, ...currentRoles.filter(r => r === 'recruiter')] };
    }
    if (role === 'employer' && currentRoles.includes('job_seeker')) {
      return { selectedRoles: [role, ...currentRoles.filter(r => r === 'recruiter')] };
    }
    
    // Add the role
    return { selectedRoles: [...currentRoles, role] };
  }),
  reset: () => set({ username: '', selectedRoles: [] }),
}));
