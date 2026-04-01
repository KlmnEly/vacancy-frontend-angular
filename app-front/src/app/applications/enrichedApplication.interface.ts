import { Vacancy } from '../vacancies/vanancies.interface';
import { ApplicationStatus } from './application-status.enum';

export interface EnrichedApplication {
  idApplication: number;
  appliedAt: string;
  vacancyId?: number;
  userId?: number;
  userEmail?: string;
  vacancyDetails?: Vacancy;
  status: ApplicationStatus;
}
