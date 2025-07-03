export interface ClinicalCode {
  title: string;
  code: string;
  description: string;
  confidence: "high" | "medium" | "low";
}

export interface SuggestedTask {
  task_type: string;
  description: string;
  priority: "high" | "medium" | "low";
  assigned_to: "GP" | "Nurse" | "Admin" | "Pharmacist" | "Specialist";
}

export interface PatientInfo {
  name: string;
  dob: string;
  nhs_number: string;
  address: string;
}

export interface MedicalDocumentResponse {
  document_type: "prescription" | "lab_report" | "discharge_summary" | "referral_letter" | "other";
  document_date: string;
  document_sender: string;
  document_receiver: string;
  summary: string;
  clinical_codes: ClinicalCode[];
  suggested_tasks: SuggestedTask[];
  patient_info: PatientInfo;
  processing_time: number;
  status: string;
  timestamp: string;
}

export interface ProcessedDocument {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  document_type?: string;
  document_date?: string;
  document_sender?: string;
  document_receiver?: string;
  summary?: string;
  clinical_codes: ClinicalCode[];
  suggested_tasks: SuggestedTask[];
  patient_info?: PatientInfo;
  processing_time?: number;
  status: "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}