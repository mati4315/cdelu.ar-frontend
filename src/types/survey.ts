export interface SurveyOption {
  id: number;
  option_text: string;
  votes_count: number;
  percentage?: number;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Survey {
  id: number;
  question: string;
  status: 'active' | 'inactive' | 'completed';
  is_multiple_choice: boolean;
  max_votes_per_user: number;
  total_votes: number;
  options_count: number;
  user_voted?: boolean;
  user_votes?: number[];
  created_at: string;
  updated_at: string;
  expires_at?: string;
  options: SurveyOption[];
}

export interface SurveyStats {
  id: number;
  question: string;
  total_votes: number;
  registered_voters: number;
  unique_ips: number;
  options: SurveyOption[];
}

export interface SurveyVoteRequest {
  option_ids: number[];
}

export interface SurveyCreateRequest {
  question: string;
  options: string[];
  is_multiple_choice: boolean;
  max_votes_per_user: number;
  expires_at?: string;
}

export interface SurveyUpdateRequest {
  question?: string;
  status?: 'active' | 'inactive' | 'completed';
  expires_at?: string;
}

export interface SurveyListResponse {
  success: boolean;
  data: Survey[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface SurveyResponse {
  success: boolean;
  data: Survey;
  message?: string;
}

export interface SurveyStatsResponse {
  success: boolean;
  data: SurveyStats;
  message?: string;
}

export interface SurveyVoteResponse {
  success: boolean;
  message: string;
  isAlreadyVoted?: boolean;
  isUnauthorized?: boolean;
}

export interface SurveyCreateResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
  };
}

export interface SurveyUpdateResponse {
  success: boolean;
  message: string;
}

export interface SurveyDeleteResponse {
  success: boolean;
  message: string;
}

export interface SurveyFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'completed' | 'all';
}

export interface SurveyError {
  success: false;
  error: string;
  message: string;
} 