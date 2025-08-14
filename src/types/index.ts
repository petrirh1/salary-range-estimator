export interface SalaryRangeRequest {
	jobTitle: string;
	experience: number;
	education?: string;
	industry: string;
	location?: string;
	technologies: string[];
	currentSalary?: number;
}

export interface SalaryRangeResponse {
	salaryRange: string;
	salaryAnalysis: string;
}

export interface FormValidValuesResponse {
	jobTitles: string[];
	locations: string[];
	industries: string[];
	educations: string[];
	technologies: string[];
}
