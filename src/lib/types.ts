export interface Analysis {
  id: string;
  name: string;
  user_id: string;
  data: AnalysisData;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  location: string;
}

export interface Parameter {
  id: string;
  user_id: string;
  title: string;
  description: string;
  sort_order: number;
  is_default: boolean;
  created_at: string;
}

export interface AnalysisData {
  schools?: School[];
  grades?: Record<string, Record<string, number>>;
  notes?: Record<string, Record<string, string>>;
}

export type AnalysisInsert = {
  name: string;
  data?: AnalysisData;
};

export type AnalysisUpdate = {
  name?: string;
  data?: AnalysisData;
};

export type AuthView =
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email';

export type AppView = 'home' | 'editor' | 'settings' | 'dashboard';
