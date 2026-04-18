// frontend/src/api/recruitmentApi.ts
import apiClient from "./axiosClient";
import { PaginationParams, PaginatedResponse } from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Recruitment API request/response types
export interface JobPostingDTO {
  id: number;
  organizationId: number;
  title: string;
  description: string;
  requirements: string;
  department: {
    id: number;
    name: string;
  };
  location: {
    id: number;
    name: string;
    city: string;
    country: string;
  };
  employmentType: JobEmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  status: JobPostingStatus;
  postedBy: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  applicationDeadline?: string;
  startDate?: string;
  isRemote: boolean;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  benefitsOffered: string[];
  applicationCount: number;
  viewCount: number;
  postedAt: string;
  updatedAt: string;
}

export interface JobPostingCreateDTO {
  organizationId: number;
  title: string;
  description: string;
  requirements: string;
  departmentId: number;
  locationId: number;
  employmentType: JobEmploymentType;
  salaryMin?: number | undefined;
  salaryMax?: number | undefined;
  currency?: string | undefined;
  applicationDeadline?: string | undefined;
  startDate?: string | undefined;
  isRemote: boolean;
  experienceLevel: ExperienceLevel;
  skillsRequired: string[];
  benefitsOffered: string[];
}

export interface CandidateDTO {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  resumeUrl?: string;
  linkedInProfile?: string;
  portfolioUrl?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  expectedSalary?: number;
  availabilityDate?: string;
  location: string;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
  }>;
  workExperience: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDTO {
  id: number;
  jobPosting: {
    id: number;
    title: string;
    department: string;
    location: string;
  };
  candidate: CandidateDTO;
  status: ApplicationStatus;
  appliedAt: string;
  coverLetter?: string;
  customAnswers?: Array<{
    question: string;
    answer: string;
  }>;
  reviewedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  reviewComments?: string;
  reviewedAt?: string;
  rating?: number;
  tags: string[];
  source: ApplicationSource;
  updatedAt: string;
}

export interface InterviewDTO {
  id: number;
  application: {
    id: number;
    candidate: {
      id: number;
      fullName: string;
      email: string;
    };
    jobPosting: {
      id: number;
      title: string;
    };
  };
  type: InterviewType;
  scheduledAt: string;
  duration: number; // in minutes
  location?: string;
  meetingLink?: string;
  interviewer: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  };
  additionalInterviewers: Array<{
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  }>;
  status: InterviewStatus;
  feedback?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewCreateDTO {
  applicationId: number;
  type: InterviewType;
  scheduledAt: string;
  duration: number;
  location?: string | undefined;
  meetingLink?: string | undefined;
  interviewerId: number;
  additionalInterviewerIds?: number[] | undefined;
  notes?: string | undefined;
}

// Enums
export enum JobPostingStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum JobEmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY'
}

export enum ExperienceLevel {
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  MID_LEVEL = 'MID_LEVEL',
  SENIOR_LEVEL = 'SENIOR_LEVEL',
  EXECUTIVE = 'EXECUTIVE'
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum ApplicationSource {
  COMPANY_WEBSITE = 'COMPANY_WEBSITE',
  JOB_BOARD = 'JOB_BOARD',
  LINKEDIN = 'LINKEDIN',
  REFERRAL = 'REFERRAL',
  RECRUITER = 'RECRUITER',
  DIRECT_APPLICATION = 'DIRECT_APPLICATION'
}

export enum InterviewType {
  PHONE_SCREENING = 'PHONE_SCREENING',
  VIDEO_INTERVIEW = 'VIDEO_INTERVIEW',
  IN_PERSON = 'IN_PERSON',
  TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
  PANEL_INTERVIEW = 'PANEL_INTERVIEW',
  FINAL_INTERVIEW = 'FINAL_INTERVIEW'
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

// Search parameters
export interface JobPostingSearchParams extends PaginationParams {
  organizationId?: number;
  departmentId?: number;
  locationId?: number;
  status?: JobPostingStatus;
  employmentType?: JobEmploymentType;
  experienceLevel?: ExperienceLevel;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  search?: string;
  postedAfter?: string;
  postedBefore?: string;
}

export interface ApplicationSearchParams extends PaginationParams {
  jobPostingId?: number;
  candidateId?: number;
  status?: ApplicationStatus;
  source?: ApplicationSource;
  appliedAfter?: string;
  appliedBefore?: string;
  reviewedBy?: number;
  rating?: number;
  search?: string;
}

export interface InterviewSearchParams extends PaginationParams {
  applicationId?: number;
  interviewerId?: number;
  type?: InterviewType;
  status?: InterviewStatus;
  scheduledAfter?: string;
  scheduledBefore?: string;
  search?: string;
}

// Recruitment API client interface
export interface RecruitmentApiClient {
  // Job Postings
  getJobPostings(params: JobPostingSearchParams): Promise<PaginatedResponse<JobPostingDTO>>;
  getJobPosting(id: number): Promise<JobPostingDTO>;
  createJobPosting(data: JobPostingCreateDTO): Promise<JobPostingDTO>;
  updateJobPosting(id: number, data: Partial<JobPostingCreateDTO>): Promise<JobPostingDTO>;
  deleteJobPosting(id: number): Promise<void>;
  publishJobPosting(id: number): Promise<JobPostingDTO>;
  pauseJobPosting(id: number): Promise<JobPostingDTO>;
  closeJobPosting(id: number): Promise<JobPostingDTO>;

  // Candidates
  getCandidates(params?: PaginationParams): Promise<PaginatedResponse<CandidateDTO>>;
  getCandidate(id: number): Promise<CandidateDTO>;
  createCandidate(data: Partial<CandidateDTO>): Promise<CandidateDTO>;
  updateCandidate(id: number, data: Partial<CandidateDTO>): Promise<CandidateDTO>;
  deleteCandidate(id: number): Promise<void>;

  // Applications
  getApplications(params: ApplicationSearchParams): Promise<PaginatedResponse<ApplicationDTO>>;
  getApplication(id: number): Promise<ApplicationDTO>;
  createApplication(data: Partial<ApplicationDTO>): Promise<ApplicationDTO>;
  updateApplicationStatus(id: number, status: ApplicationStatus, comments?: string): Promise<ApplicationDTO>;
  rateApplication(id: number, rating: number, comments?: string): Promise<ApplicationDTO>;
  addApplicationTags(id: number, tags: string[]): Promise<ApplicationDTO>;

  // Interviews
  getInterviews(params: InterviewSearchParams): Promise<PaginatedResponse<InterviewDTO>>;
  getInterview(id: number): Promise<InterviewDTO>;
  scheduleInterview(data: InterviewCreateDTO): Promise<InterviewDTO>;
  updateInterview(id: number, data: Partial<InterviewCreateDTO>): Promise<InterviewDTO>;
  cancelInterview(id: number, reason: string): Promise<InterviewDTO>;
  completeInterview(id: number, feedback: string, rating?: number): Promise<InterviewDTO>;

  // Conversion
  convertCandidateToEmployee(candidateId: number, employeeData: any): Promise<any>;

  // Analytics
  getRecruitmentAnalytics(organizationId: number, dateFrom?: string, dateTo?: string): Promise<any>;
}

// Implementation of recruitment API client
class RecruitmentApiClientImpl implements RecruitmentApiClient {
  private readonly RECRUITMENT_ENDPOINTS = {
    // Job Postings
    JOB_POSTINGS: '/recruitment/jobs',
    JOB_POSTING_BY_ID: (id: number) => `/recruitment/jobs/${id}`,
    PUBLISH_JOB: (id: number) => `/recruitment/jobs/${id}/publish`,
    PAUSE_JOB: (id: number) => `/recruitment/jobs/${id}/pause`,
    CLOSE_JOB: (id: number) => `/recruitment/jobs/${id}/close`,

    // Candidates
    CANDIDATES: '/recruitment/candidates',
    CANDIDATE_BY_ID: (id: number) => `/recruitment/candidates/${id}`,

    // Applications
    APPLICATIONS: '/recruitment/applications',
    APPLICATION_BY_ID: (id: number) => `/recruitment/applications/${id}`,
    UPDATE_APPLICATION_STATUS: (id: number) => `/recruitment/applications/${id}/status`,
    RATE_APPLICATION: (id: number) => `/recruitment/applications/${id}/rate`,
    APPLICATION_TAGS: (id: number) => `/recruitment/applications/${id}/tags`,
    HIRE_CANDIDATE: (applicationId: number) => `/recruitment/applications/${applicationId}/hire`,

    // Interviews
    INTERVIEWS: '/recruitment/interviews',
    INTERVIEW_BY_ID: (id: number) => `/recruitment/interviews/${id}`,
    CANCEL_INTERVIEW: (id: number) => `/recruitment/interviews/${id}/cancel`,
    COMPLETE_INTERVIEW: (id: number) => `/recruitment/interviews/${id}/complete`,

    // Conversion
    CONVERT_CANDIDATE: (candidateId: number) => `/recruitment/candidates/${candidateId}/convert-to-employee`,

    // Analytics
    ANALYTICS: '/recruitment/statistics'
  } as const;

  private normalizeJobPosting(raw: any): JobPostingDTO {
    const department = raw.department ?? {
      id: raw.departmentId ?? 0,
      name: raw.departmentName ?? 'Unassigned',
    };

    const location = raw.location ?? {
      id: raw.locationId ?? 0,
      name: raw.locationName ?? 'Remote',
      city: raw.locationName ?? 'Remote',
      country: 'India',
    };

    const postedBy = raw.postedBy ?? {
      id: raw.hiringManagerId ?? 0,
      firstName: raw.hiringManagerName?.split(' ')[0] ?? 'Talent',
      lastName: raw.hiringManagerName?.split(' ').slice(1).join(' ') || 'Lead',
      fullName: raw.hiringManagerName ?? 'Talent Lead',
    };

    return {
      id: Number(raw.id),
      organizationId: Number(raw.organizationId ?? 1),
      title: raw.title ?? '',
      description: raw.description ?? '',
      requirements: raw.requirements ?? '',
      department,
      location,
      employmentType: (raw.employmentType ?? JobEmploymentType.FULL_TIME) as JobEmploymentType,
      salaryMin: raw.salaryMin ?? undefined,
      salaryMax: raw.salaryMax ?? undefined,
      currency: raw.currency ?? raw.salaryCurrency ?? 'USD',
      status: (raw.status ?? JobPostingStatus.DRAFT) as JobPostingStatus,
      postedBy,
      applicationDeadline: raw.applicationDeadline ?? raw.closingDate ?? undefined,
      startDate: raw.startDate ?? undefined,
      isRemote: Boolean(raw.isRemote),
      experienceLevel: (raw.experienceLevel ?? ExperienceLevel.MID_LEVEL) as ExperienceLevel,
      skillsRequired: Array.isArray(raw.skillsRequired) ? raw.skillsRequired : [],
      benefitsOffered: Array.isArray(raw.benefitsOffered) ? raw.benefitsOffered : [],
      applicationCount: Number(raw.applicationCount ?? 0),
      viewCount: Number(raw.viewCount ?? 0),
      postedAt: raw.postedAt ?? raw.postingDate ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    };
  }

  private normalizeApplication(raw: any): ApplicationDTO {
    return {
      id: Number(raw.id),
      jobPosting: raw.jobPosting ?? {
        id: raw.jobPostingId ?? 0,
        title: raw.jobTitle ?? 'Unknown role',
        department: raw.departmentName ?? 'Unassigned',
        location: raw.jobLocation ?? 'Remote',
      },
      candidate: raw.candidate ?? {
        id: raw.candidateId ?? 0,
        firstName: raw.candidateFirstName ?? '',
        lastName: raw.candidateLastName ?? '',
        fullName: `${raw.candidateFirstName ?? ''} ${raw.candidateLastName ?? ''}`.trim(),
        email: raw.candidateEmail ?? '',
        phoneNumber: raw.candidatePhone ?? undefined,
        location: raw.candidateCity ?? 'Unknown',
        skills: [],
        education: [],
        workExperience: [],
        createdAt: raw.createdAt ?? new Date().toISOString(),
        updatedAt: raw.updatedAt ?? new Date().toISOString(),
      },
      status: (raw.status ?? raw.applicationStatus ?? ApplicationStatus.APPLIED) as ApplicationStatus,
      appliedAt: raw.appliedAt ?? raw.applicationDate ?? new Date().toISOString(),
      coverLetter: raw.coverLetter ?? undefined,
      reviewedBy: raw.reviewedBy ?? undefined,
      reviewComments: raw.reviewComments ?? raw.notes ?? undefined,
      reviewedAt: raw.reviewedAt ?? undefined,
      rating: raw.rating ?? undefined,
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      source: (raw.source ?? ApplicationSource.DIRECT_APPLICATION) as ApplicationSource,
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
  }

  private normalizeInterview(raw: any): InterviewDTO {
    return {
      id: Number(raw.id),
      application: raw.application,
      type: (raw.type ?? InterviewType.PHONE_SCREENING) as InterviewType,
      scheduledAt: raw.scheduledAt ?? new Date().toISOString(),
      duration: Number(raw.duration ?? 60),
      location: raw.location ?? undefined,
      meetingLink: raw.meetingLink ?? undefined,
      interviewer: raw.interviewer ?? {
        id: 0,
        firstName: 'Talent',
        lastName: 'Lead',
        fullName: 'Talent Lead',
        email: 'talent.lead@talentx.local',
      },
      additionalInterviewers: Array.isArray(raw.additionalInterviewers) ? raw.additionalInterviewers : [],
      status: (raw.status ?? InterviewStatus.SCHEDULED) as InterviewStatus,
      feedback: raw.feedback ?? undefined,
      rating: raw.rating ?? undefined,
      notes: raw.notes ?? undefined,
      createdAt: raw.createdAt ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? new Date().toISOString(),
    };
  }

  // Job Postings
  async getJobPostings(params: JobPostingSearchParams): Promise<PaginatedResponse<JobPostingDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockJobPostings } = await import('./mockData');

      let filtered = [...mockJobPostings];

      if (params.organizationId) {
        filtered = filtered.filter(jp => jp.organizationId === params.organizationId);
      }
      if (params.departmentId) {
        filtered = filtered.filter(jp => jp.department.id === params.departmentId);
      }
      if (params.locationId) {
        filtered = filtered.filter(jp => jp.location.id === params.locationId);
      }
      if (params.status) {
        filtered = filtered.filter(jp => jp.status === params.status);
      }
      if (params.employmentType) {
        filtered = filtered.filter(jp => jp.employmentType === params.employmentType);
      }
      if (params.experienceLevel) {
        filtered = filtered.filter(jp => jp.experienceLevel === params.experienceLevel);
      }
      if (params.isRemote !== undefined) {
        filtered = filtered.filter(jp => jp.isRemote === params.isRemote);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(jp =>
          jp.title.toLowerCase().includes(search) ||
          jp.description.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<PaginatedResponse<any>>(
      `${this.RECRUITMENT_ENDPOINTS.JOB_POSTINGS}?${queryParams}`
    );
    return {
      ...response,
      content: response.content.map((item: any) => this.normalizeJobPosting(item))
    };
  }

  async getJobPosting(id: number): Promise<JobPostingDTO> {
    return this.normalizeJobPosting(await apiClient.get<any>(this.RECRUITMENT_ENDPOINTS.JOB_POSTING_BY_ID(id)));
  }

  async createJobPosting(data: JobPostingCreateDTO): Promise<JobPostingDTO> {
    return this.normalizeJobPosting(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.JOB_POSTINGS, data));
  }

  async updateJobPosting(id: number, data: Partial<JobPostingCreateDTO>): Promise<JobPostingDTO> {
    return this.normalizeJobPosting(await apiClient.put<any>(this.RECRUITMENT_ENDPOINTS.JOB_POSTING_BY_ID(id), data));
  }

  async deleteJobPosting(id: number): Promise<void> {
    return apiClient.delete<void>(this.RECRUITMENT_ENDPOINTS.JOB_POSTING_BY_ID(id));
  }

  async publishJobPosting(id: number): Promise<JobPostingDTO> {
    return this.normalizeJobPosting(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.PUBLISH_JOB(id), {}));
  }

  async pauseJobPosting(id: number): Promise<JobPostingDTO> {
    return this.normalizeJobPosting(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.PAUSE_JOB(id), {}));
  }

  async closeJobPosting(id: number): Promise<JobPostingDTO> {
    return this.normalizeJobPosting(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.CLOSE_JOB(id), {}));
  }

  // Candidates
  async getCandidates(params: PaginationParams = { page: 0, size: 10 }): Promise<PaginatedResponse<CandidateDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<CandidateDTO>>(
      `${this.RECRUITMENT_ENDPOINTS.CANDIDATES}?${queryParams}`
    );
  }

  async getCandidate(id: number): Promise<CandidateDTO> {
    return apiClient.get<CandidateDTO>(this.RECRUITMENT_ENDPOINTS.CANDIDATE_BY_ID(id));
  }

  async createCandidate(data: Partial<CandidateDTO>): Promise<CandidateDTO> {
    return apiClient.post<CandidateDTO>(this.RECRUITMENT_ENDPOINTS.CANDIDATES, data);
  }

  async updateCandidate(id: number, data: Partial<CandidateDTO>): Promise<CandidateDTO> {
    return apiClient.put<CandidateDTO>(this.RECRUITMENT_ENDPOINTS.CANDIDATE_BY_ID(id), data);
  }

  async deleteCandidate(id: number): Promise<void> {
    return apiClient.delete<void>(this.RECRUITMENT_ENDPOINTS.CANDIDATE_BY_ID(id));
  }

  // Applications
  async getApplications(params: ApplicationSearchParams): Promise<PaginatedResponse<ApplicationDTO>> {
    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<PaginatedResponse<any>>(
      `${this.RECRUITMENT_ENDPOINTS.APPLICATIONS}?${queryParams}`
    );
    return {
      ...response,
      content: response.content.map((item: any) => this.normalizeApplication(item))
    };
  }

  async getApplication(id: number): Promise<ApplicationDTO> {
    return this.normalizeApplication(await apiClient.get<any>(this.RECRUITMENT_ENDPOINTS.APPLICATION_BY_ID(id)));
  }

  async createApplication(data: Partial<ApplicationDTO>): Promise<ApplicationDTO> {
    return apiClient.post<ApplicationDTO>(this.RECRUITMENT_ENDPOINTS.APPLICATIONS, data);
  }

  async updateApplicationStatus(id: number, status: ApplicationStatus, comments?: string): Promise<ApplicationDTO> {
    return this.normalizeApplication(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.UPDATE_APPLICATION_STATUS(id), null, {
      params: { status, notes: comments }
    }));
  }

  async rateApplication(id: number, rating: number, comments?: string): Promise<ApplicationDTO> {
    return this.normalizeApplication(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.RATE_APPLICATION(id), null, {
      params: { rating, feedback: comments }
    }));
  }

  async updateApplicationEvaluation(id: number, data: { rating: number, feedback: string, tags: string[] }): Promise<ApplicationDTO> {
    await this.rateApplication(id, data.rating, data.feedback);
    return this.addApplicationTags(id, data.tags);
  }

  async addApplicationTags(id: number, tags: string[]): Promise<ApplicationDTO> {
    return this.normalizeApplication(await apiClient.put<any>(this.RECRUITMENT_ENDPOINTS.APPLICATION_TAGS(id), { tags }));
  }

  // Interviews
  async getInterviews(params: InterviewSearchParams): Promise<PaginatedResponse<InterviewDTO>> {
    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<PaginatedResponse<any>>(
      `${this.RECRUITMENT_ENDPOINTS.INTERVIEWS}?${queryParams}`
    );
    return {
      ...response,
      content: response.content.map((item: any) => this.normalizeInterview(item))
    };
  }

  async getInterview(id: number): Promise<InterviewDTO> {
    return this.normalizeInterview(await apiClient.get<any>(this.RECRUITMENT_ENDPOINTS.INTERVIEW_BY_ID(id)));
  }

  async scheduleInterview(data: InterviewCreateDTO): Promise<InterviewDTO> {
    return this.normalizeInterview(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.INTERVIEWS, data));
  }

  async updateInterview(id: number, data: Partial<InterviewCreateDTO>): Promise<InterviewDTO> {
    return this.normalizeInterview(await apiClient.put<any>(this.RECRUITMENT_ENDPOINTS.INTERVIEW_BY_ID(id), data));
  }

  async cancelInterview(id: number, reason: string): Promise<InterviewDTO> {
    return this.normalizeInterview(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.CANCEL_INTERVIEW(id), { reason }));
  }

  async completeInterview(id: number, feedback: string, rating?: number): Promise<InterviewDTO> {
    return this.normalizeInterview(await apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.COMPLETE_INTERVIEW(id), {
      feedback,
      rating
    }));
  }

  // Conversion
  async convertCandidateToEmployee(candidateId: number, employeeData: any): Promise<any> {
    return apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.CONVERT_CANDIDATE(candidateId), employeeData);
  }

  async convertApplicationToEmployee(applicationId: number, hiringData: any): Promise<any> {
    return apiClient.post<any>(this.RECRUITMENT_ENDPOINTS.HIRE_CANDIDATE(applicationId), hiringData);
  }

  // Analytics
  async getRecruitmentAnalytics(organizationId: number, dateFrom?: string, dateTo?: string): Promise<any> {
    const params = new URLSearchParams({ organizationId: organizationId.toString() });
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    return apiClient.get<any>(`${this.RECRUITMENT_ENDPOINTS.ANALYTICS}?${params}`);
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }
}

// Create and export singleton instance
const recruitmentApi = new RecruitmentApiClientImpl();

export default recruitmentApi;

// Export the class for testing purposes
export { RecruitmentApiClientImpl };
