import { supabase } from '@/integrations/supabase/client';
import { ProcessedDocument, MedicalDocumentResponse } from '@/types/medical';

export const supabaseService = {
  async uploadFile(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('medical-documents')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Create a signed URL that's valid for 1 hour - this will work with external APIs
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('medical-documents')
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (urlError) {
      throw new Error(`Failed to create signed URL: ${urlError.message}`);
    }

    return signedUrlData.signedUrl;
  },

  async saveProcessedDocument(
    userId: string,
    filename: string,
    fileUrl: string,
    apiResponse: MedicalDocumentResponse
  ): Promise<ProcessedDocument> {
    const { data, error } = await supabase
      .from('processed_documents')
      .insert({
        user_id: userId,
        filename,
        file_url: fileUrl,
        document_type: apiResponse.document_type,
        document_date: apiResponse.document_date,
        document_sender: apiResponse.document_sender,
        document_receiver: apiResponse.document_receiver,
        summary: apiResponse.summary,
        clinical_codes: JSON.stringify(apiResponse.clinical_codes),
        suggested_tasks: JSON.stringify(apiResponse.suggested_tasks),
        patient_info: JSON.stringify(apiResponse.patient_info),
        processing_time: apiResponse.processing_time,
        status: 'completed'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save document: ${error.message}`);
    }

    // Transform the data to match our ProcessedDocument type
    const processedDoc: ProcessedDocument = {
      id: data.id,
      user_id: data.user_id,
      filename: data.filename,
      file_url: data.file_url,
      document_type: data.document_type,
      document_date: data.document_date,
      document_sender: data.document_sender,
      document_receiver: data.document_receiver,
      summary: data.summary,
      clinical_codes: typeof data.clinical_codes === 'string' 
        ? JSON.parse(data.clinical_codes) 
        : data.clinical_codes || [],
      suggested_tasks: typeof data.suggested_tasks === 'string' 
        ? JSON.parse(data.suggested_tasks) 
        : data.suggested_tasks || [],
      patient_info: typeof data.patient_info === 'string' 
        ? JSON.parse(data.patient_info) 
        : data.patient_info,
      processing_time: data.processing_time,
      status: data.status as "processing" | "completed" | "failed",
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return processedDoc;
  },

  async getProcessedDocuments(userId: string): Promise<ProcessedDocument[]> {
    const { data, error } = await supabase
      .from('processed_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    // Transform the data to match our ProcessedDocument type
    return (data || []).map(doc => ({
      id: doc.id,
      user_id: doc.user_id,
      filename: doc.filename,
      file_url: doc.file_url,
      document_type: doc.document_type,
      document_date: doc.document_date,
      document_sender: doc.document_sender,
      document_receiver: doc.document_receiver,
      summary: doc.summary,
      clinical_codes: typeof doc.clinical_codes === 'string' 
        ? JSON.parse(doc.clinical_codes) 
        : doc.clinical_codes || [],
      suggested_tasks: typeof doc.suggested_tasks === 'string' 
        ? JSON.parse(doc.suggested_tasks) 
        : doc.suggested_tasks || [],
      patient_info: typeof doc.patient_info === 'string' 
        ? JSON.parse(doc.patient_info) 
        : doc.patient_info,
      processing_time: doc.processing_time,
      status: doc.status as "processing" | "completed" | "failed",
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));
  },

  async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('processed_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
};