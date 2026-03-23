export interface Vacancy {
  idVacancy: number;
  title: string;
  description: string;
  technologies: string;
  seniority: string;
  softSkills: string;
  location: string;
  modality: string;
  salaryRange: string;
  company: string;
  maxApplicants: number;
  status: string;
  remainingSlots: number;
  canApply: boolean;
  createdAt: string;
}

export interface ApiResponse {
  success: boolean;
  data: Vacancy[];
  message: string;
}