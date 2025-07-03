import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, BarChart3, Users } from 'lucide-react';

const Index = () => {
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
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        {/* Add more stat cards here */}
      </div>

      {/* Upload Section */}
      <Card className="border-dashed border-2 border-primary/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Medical Document
          </CardTitle>
          <CardDescription>
            Drop your PDF here or click to browse (Max 50MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button variant="upload" size="lg" className="w-full max-w-md">
            Choose PDF File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
