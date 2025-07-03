import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BarChart3, Users, Activity } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ProcessedDocument } from '@/types/medical';

const Index = () => {
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);

  const handleDocumentProcessed = (document: ProcessedDocument) => {
    setProcessedDocuments(prev => [document, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          AI-Powered Medical Document Processing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload medical PDFs and get instant clinical insights, SNOMED CT codes, and actionable tasks
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedDocuments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clinical Codes Found</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedDocuments.reduce((sum, doc) => sum + doc.clinical_codes.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggested Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedDocuments.reduce((sum, doc) => sum + doc.suggested_tasks.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedDocuments.length > 0 
                ? `${(processedDocuments.reduce((sum, doc) => sum + (doc.processing_time || 0), 0) / processedDocuments.length).toFixed(1)}s`
                : '0s'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <FileUpload onDocumentProcessed={handleDocumentProcessed} />
    </div>
  );
};

export default Index;
