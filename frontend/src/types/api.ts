import { AccidentReportFormData } from './accident-report';

export interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  pesel: string;
  form_data: AccidentReportFormData;
  ai_suggestion?: number | null;
  ai_comments?: Record<string, any> | null;
  status?: string | null;
  attachment_ids: string[];
}

export interface ApplicationListItem {
  id: string;
  pesel: string;
  created_at: string;
  status?: string | null;
  ai_suggestion?: number | null;
  summary?: string | null;
  attachment_count: number;
}

export interface ApplicationListResponse {
  items: ApplicationListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AttachmentMetadata {
  id: string;
  title: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface AttachmentListResponse {
  attachments: AttachmentMetadata[];
}

export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

