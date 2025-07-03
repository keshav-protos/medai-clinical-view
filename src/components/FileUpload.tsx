import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { medAiApi } from '@/services/medAiApi';
import { useToast } from '@/hooks/use-toast';
import { ProcessedDocument } from '@/types/medical';

interface FileUploadProps {
  onDocumentProcessed: (document: ProcessedDocument) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDocumentProcessed }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: processingStatus !== 'idle'
  });

  const uploadAndProcess = async () => {
    if (!selectedFile || !user) return;

    try {
      setProcessingStatus('uploading');
      setUploadProgress(20);

      // Upload file to Supabase
      const fileUrl = await supabaseService.uploadFile(selectedFile, user.id);
      setUploadProgress(50);

      setProcessingStatus('processing');
      setUploadProgress(70);

      // Process with Med-AI API
      const apiResponse = await medAiApi.processDocument(fileUrl);
      setUploadProgress(90);

      // Save to database
      const processedDoc = await supabaseService.saveProcessedDocument(
        user.id,
        selectedFile.name,
        fileUrl,
        apiResponse
      );

      setUploadProgress(100);
      setProcessingStatus('complete');

      toast({
        title: "Document processed successfully!",
        description: `${selectedFile.name} has been analyzed and saved.`,
      });

      onDocumentProcessed(processedDoc);

      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setProcessingStatus('idle');
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setProcessingStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setProcessingStatus('idle');
    setUploadProgress(0);
    setError(null);
  };

  const getStatusIcon = () => {
    switch (processingStatus) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'uploading':
      case 'processing':
        return <Upload className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (processingStatus) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing with AI...';
      case 'complete':
        return 'Complete!';
      case 'error':
        return 'Failed';
      default:
        return 'Upload Medical Document';
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 hover:border-primary/50 transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </CardTitle>
        <CardDescription>
          {processingStatus === 'idle' 
            ? "Drop your PDF here or click to browse (Max 50MB)"
            : selectedFile?.name
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processingStatus === 'idle' && (
          <div
            {...getRootProps()}
            className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file'}
                </p>
                <p className="text-sm text-muted-foreground">or click to select</p>
              </div>
            </div>
          </div>
        )}

        {selectedFile && processingStatus === 'idle' && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetUpload}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {(processingStatus === 'uploading' || processingStatus === 'processing') && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              {processingStatus === 'uploading' ? 'Uploading file...' : 'Analyzing document...'}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {selectedFile && processingStatus === 'idle' && (
          <Button
            onClick={uploadAndProcess}
            className="w-full"
            variant="medical"
            size="lg"
          >
            <Upload className="h-4 w-4 mr-2" />
            Process Document
          </Button>
        )}

        {processingStatus === 'error' && (
          <Button
            onClick={resetUpload}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};