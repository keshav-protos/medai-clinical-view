import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  Eye, 
  Copy,
  Download,
  Stethoscope,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { ProcessedDocument, ClinicalCode, SuggestedTask } from '@/types/medical';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const docs = await supabaseService.getProcessedDocuments(user.id);
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocument) {
        setSelectedDocument(docs[0]);
      }
    } catch (error) {
      toast({
        title: "Error fetching documents",
        description: error instanceof Error ? error.message : 'Failed to load documents',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied successfully",
    });
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      prescription: "bg-blue-500",
      lab_report: "bg-green-500",
      discharge_summary: "bg-purple-500",
      referral_letter: "bg-orange-500",
      other: "bg-gray-500"
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getConfidenceColor = (confidence: string) => {
    const colors = {
      high: "bg-green-500",
      medium: "bg-yellow-500",
      low: "bg-red-500"
    };
    return colors[confidence as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
        <p className="text-muted-foreground mb-4">
          Upload your first medical document to get started
        </p>
        <Button onClick={() => window.location.href = '/'} variant="medical">
          Upload Document
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Document Dashboard
          </h1>
          <p className="text-muted-foreground">
            View and manage your processed medical documents
          </p>
        </div>
        <Button onClick={fetchDocuments} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocument?.id === doc.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm truncate flex-1">
                        {doc.filename}
                      </h4>
                      <Badge 
                        className={`${getDocumentTypeColor(doc.document_type || 'other')} text-white text-xs`}
                      >
                        {doc.document_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                    {doc.processing_time && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {doc.processing_time}s processing
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Document Details */}
        <div className="lg:col-span-2">
          {selectedDocument ? (
            <div className="space-y-6">
              {/* Document Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {selectedDocument.filename}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {selectedDocument.document_date || 'No date'}
                        </div>
                        {selectedDocument.processing_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedDocument.processing_time}s
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      className={`${getDocumentTypeColor(selectedDocument.document_type || 'other')} text-white`}
                    >
                      {selectedDocument.document_type?.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Document Content Tabs */}
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="codes">Clinical Codes</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="patient">Patient Info</TabsTrigger>
                </TabsList>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Clinical Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm leading-relaxed">
                            {selectedDocument.summary || 'No summary available'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedDocument.summary || '')}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Summary
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document Metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Sender</label>
                          <p className="mt-1">{selectedDocument.document_sender || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Receiver</label>
                          <p className="mt-1">{selectedDocument.document_receiver || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Created</label>
                          <p className="mt-1">{new Date(selectedDocument.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <Badge variant="outline" className="mt-1">
                            {selectedDocument.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Clinical Codes Tab */}
                <TabsContent value="codes">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Clinical Codes ({selectedDocument.clinical_codes.length})
                      </CardTitle>
                      <CardDescription>
                        SNOMED CT codes identified in the document
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedDocument.clinical_codes.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Code</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Confidence</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedDocument.clinical_codes.map((code: ClinicalCode, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{code.title}</TableCell>
                                <TableCell className="font-mono text-sm">{code.code}</TableCell>
                                <TableCell>{code.description}</TableCell>
                                <TableCell>
                                  <Badge className={`${getConfidenceColor(code.confidence)} text-white`}>
                                    {code.confidence}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No clinical codes found in this document
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        Suggested Tasks ({selectedDocument.suggested_tasks.length})
                      </CardTitle>
                      <CardDescription>
                        AI-generated action items based on document content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedDocument.suggested_tasks.length > 0 ? (
                        <div className="space-y-4">
                          {selectedDocument.suggested_tasks.map((task: SuggestedTask, index) => (
                            <Card key={index} className="border-l-4 border-l-primary">
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="space-y-1">
                                    <h4 className="font-medium">{task.task_type}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {task.description}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="outline">
                                      {task.assigned_to}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No tasks suggested for this document
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Patient Info Tab */}
                <TabsContent value="patient">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Patient Information
                      </CardTitle>
                      <CardDescription>
                        Patient details extracted from the document
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedDocument.patient_info ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedDocument.patient_info.name || 'Not specified'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedDocument.patient_info.dob || 'Not specified'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">NHS Number</label>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">
                                {selectedDocument.patient_info.nhs_number || 'Not specified'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedDocument.patient_info.address || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">
                          No patient information available in this document
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a document to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}