import { Vacancy } from "../vacancies/vanancies.interface";

export interface EnrichedApplication {
  idApplication: number;
  appliedAt: string;
  vacancyDetails?: Vacancy;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}